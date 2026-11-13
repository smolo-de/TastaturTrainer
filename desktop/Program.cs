// TastaturTrainer – Desktop-App (WinForms + WebView2)
//
// Was die EXE macht (bewusst wenig und nachvollziehbar):
//  1. zeigt die eingebettete Web-App (dieselben Dateien wie GitHub Pages) in einem Fenster an –
//     ausgeliefert direkt aus der EXE über eine interne Adresse, KEIN Webserver, KEIN offener Port;
//  2. speichert die Ergebnisse in der Datei „TastaturTrainer-Daten.json“ neben der EXE
//     (falls der Ordner schreibgeschützt ist: %APPDATA%\TastaturTrainer\). Datei löschen = alles zurückgesetzt;
//  3. sonst nichts: keine Netzwerkzugriffe (CSP connect-src 'none'), keine Registry, keine Admin-Rechte.
//
// Aufrufoptionen:  --data <datei>   eigener Speicherort für die Ergebnisse
//                  --devtools       Entwicklerwerkzeuge erlauben (Fehlersuche)
//                  --selftest <dir> automatischer Test (für die CI), schreibt selftest.log und screenshot.png
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace TastaturTrainer
{
    internal static class Program
    {
        internal const string Origin = "https://tastaturtrainer.example";
        internal const string WebUrl = "https://smolo-de.github.io/TastaturTrainer/";

        [STAThread]
        private static int Main(string[] args)
        {
            // Eingebettete WebView2-Bibliotheken bereitstellen, bevor irgendein WebView2-Typ benutzt wird
            AppDomain.CurrentDomain.AssemblyResolve += Embedded.ResolveAssembly;
            return Run(args);
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        private static int Run(string[] args)
        {
            Options opts;
            try { opts = Options.Parse(args); }
            catch (Exception ex) { MessageBox.Show(ex.Message, "TastaturTrainer", MessageBoxButtons.OK, MessageBoxIcon.Error); return 4; }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Nur ein Fenster pro Daten-Datei, damit sich zwei Fenster nicht gegenseitig überschreiben
            using (var mutex = new Mutex(true, "Local\\TastaturTrainer-" + Util.Sha256Hex(Encoding.UTF8.GetBytes(opts.DataFile.ToLowerInvariant())).Substring(0, 24), out bool first))
            {
                if (!first)
                {
                    MessageBox.Show(Texts.AlreadyRunning, "TastaturTrainer", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return 2;
                }
                var form = new MainForm(opts);
                Application.Run(form);
                return form.ExitCode;
            }
        }
    }

    /* ---------------- Aufrufoptionen und Speicherort ---------------- */
    internal sealed class Options
    {
        public string DataFile;
        public string SelfTestDir;
        public bool DevTools;
        public bool SelfTest => SelfTestDir != null;

        public static Options Parse(string[] args)
        {
            var o = new Options();
            for (int i = 0; i < args.Length; i++)
            {
                switch (args[i])
                {
                    case "--data": o.DataFile = Path.GetFullPath(args[++i]); break;
                    case "--devtools": o.DevTools = true; break;
                    case "--selftest": o.SelfTestDir = Path.GetFullPath(args[++i]); break;
                }
            }
            if (o.SelfTest)
            {
                Directory.CreateDirectory(o.SelfTestDir);
                o.DataFile = Path.Combine(o.SelfTestDir, "TastaturTrainer-Daten.json");
                if (File.Exists(o.DataFile)) File.Delete(o.DataFile);
            }
            if (o.DataFile == null) o.DataFile = DefaultDataFile();
            return o;
        }

        /* Neben der EXE, wenn der Ordner beschreibbar ist (USB-Stick, Downloads, eigener Ordner) – sonst %APPDATA% */
        private static string DefaultDataFile()
        {
            const string name = "TastaturTrainer-Daten.json";
            string exeDir = Path.GetDirectoryName(Application.ExecutablePath);
            if (Util.IsWritable(exeDir)) return Path.Combine(exeDir, name);
            string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TastaturTrainer");
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, name);
        }
    }

    /* ---------------- Brücke zur Web-App: nur Laden, Speichern, Löschen der einen Daten-Datei ---------------- */
    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.AutoDual)]
    public class HostBridge
    {
        private const int MaxBytes = 4 * 1024 * 1024;
        private readonly string file;

        public HostBridge(string dataFile) { file = dataFile; }

        public string DataFile => file;

        public string Load()
        {
            try
            {
                if (!File.Exists(file)) return "";
                var info = new FileInfo(file);
                if (info.Length > MaxBytes) return "";
                return File.ReadAllText(file, Encoding.UTF8);
            }
            catch { return ""; }
        }

        public bool Save(string json)
        {
            if (json == null || json.Length > MaxBytes) return false;
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(file));
                string tmp = file + ".tmp";
                File.WriteAllText(tmp, json, new UTF8Encoding(false));
                if (!File.Exists(file)) { File.Move(tmp, file); return true; }
                try { File.Replace(tmp, file, null); }
                catch (IOException) { File.Copy(tmp, file, true); File.Delete(tmp); } // z. B. Netzlaufwerke ohne Replace
                return true;
            }
            catch { return false; }
        }

        public bool Clear()
        {
            try { if (File.Exists(file)) File.Delete(file); return true; }
            catch { return false; }
        }

        /* Unlesbare Datei nicht überschreiben, sondern beiseitelegen */
        public bool BackupCorrupt()
        {
            try
            {
                if (!File.Exists(file)) return true;
                string bak = Path.Combine(Path.GetDirectoryName(file),
                    Path.GetFileNameWithoutExtension(file) + ".defekt-" + DateTime.Now.ToString("yyyyMMdd-HHmmss", CultureInfo.InvariantCulture) + ".json");
                File.Move(file, bak);
                return true;
            }
            catch { return false; }
        }
    }

    /* ---------------- Hauptfenster ---------------- */
    internal sealed class MainForm : Form
    {
        private readonly Options opts;
        private readonly WebView2 web;
        private readonly Dictionary<string, byte[]> files = Embedded.WebFiles();
        private readonly List<string> problems = new List<string>();
        private CoreWebView2Environment env;
        private bool selfTestStarted;
        public int ExitCode;

        public MainForm(Options o)
        {
            opts = o;
            Text = "TastaturTrainer";
            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { /* Standard-Icon */ }
            BackColor = Color.FromArgb(0xee, 0xf3, 0xff);
            StartPosition = FormStartPosition.CenterScreen;
            ClientSize = o.SelfTest ? new Size(1366, 900) : new Size(1300, 860);
            MinimumSize = new Size(900, 640);
            if (!o.SelfTest) WindowState = FormWindowState.Maximized;
            web = new WebView2 { Dock = DockStyle.Fill, DefaultBackgroundColor = BackColor };
            Controls.Add(web);
            Load += async (s, e) => await InitAsync();
        }

        private async Task InitAsync()
        {
            try
            {
                CoreWebView2Environment.SetLoaderDllFolderPath(Embedded.PrepareLoader());
                string version = null;
                try { version = CoreWebView2Environment.GetAvailableBrowserVersionString(); }
                catch (WebView2RuntimeNotFoundException) { }
                if (string.IsNullOrEmpty(version))
                {
                    if (!opts.SelfTest) MessageBox.Show(Texts.RuntimeMissing, "TastaturTrainer", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    WriteSelfTest("WebView2 Runtime fehlt", false);
                    ExitCode = 3; Close(); return;
                }

                string userData = opts.SelfTest
                    ? Path.Combine(opts.SelfTestDir, "WebView2")
                    : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "TastaturTrainer", "WebView2");
                env = await CoreWebView2Environment.CreateAsync(null, userData, new CoreWebView2EnvironmentOptions());
                await web.EnsureCoreWebView2Async(env);
                var core = web.CoreWebView2;

                var st = core.Settings;
                st.AreDevToolsEnabled = opts.DevTools;
                st.AreDefaultContextMenusEnabled = opts.DevTools;
                st.AreBrowserAcceleratorKeysEnabled = opts.DevTools; // kein Strg+P, F5, Strg+F … für Kinder
                st.IsStatusBarEnabled = false;
                st.IsPasswordAutosaveEnabled = false;
                st.IsGeneralAutofillEnabled = false;
                st.IsSwipeNavigationEnabled = false;
                st.IsWebMessageEnabled = false;
                st.AreHostObjectsAllowed = true;
                st.IsZoomControlEnabled = true;

                core.AddHostObjectToScript("tt", new HostBridge(opts.DataFile));
                await core.AddScriptToExecuteOnDocumentCreatedAsync("window.__TT_DESKTOP = true;");

                core.AddWebResourceRequestedFilter(Program.Origin + "/*", CoreWebView2WebResourceContext.All);
                core.WebResourceRequested += OnWebResource;
                core.NavigationStarting += (s, e) =>
                {
                    // nur die eigene App – keine fremden Seiten
                    if (!e.Uri.StartsWith(Program.Origin + "/", StringComparison.Ordinal)) e.Cancel = true;
                };
                core.NewWindowRequested += (s, e) => e.Handled = true;
                core.PermissionRequested += (s, e) => e.State = CoreWebView2PermissionState.Deny;
                core.DocumentTitleChanged += (s, e) => Text = string.IsNullOrEmpty(core.DocumentTitle) ? "TastaturTrainer" : core.DocumentTitle;

                if (opts.SelfTest)
                {
                    await core.CallDevToolsProtocolMethodAsync("Runtime.enable", "{}");
                    await core.CallDevToolsProtocolMethodAsync("Log.enable", "{}");
                    core.GetDevToolsProtocolEventReceiver("Runtime.exceptionThrown").DevToolsProtocolEventReceived += (s, e) => problems.Add("EXCEPTION " + e.ParameterObjectAsJson);
                    core.GetDevToolsProtocolEventReceiver("Log.entryAdded").DevToolsProtocolEventReceived += (s, e) =>
                    {
                        if (e.ParameterObjectAsJson.Contains("\"level\":\"error\"") || e.ParameterObjectAsJson.Contains("\"level\":\"warning\"")) problems.Add("LOG " + e.ParameterObjectAsJson);
                    };
                    core.GetDevToolsProtocolEventReceiver("Runtime.consoleAPICalled").DevToolsProtocolEventReceived += (s, e) =>
                    {
                        if (e.ParameterObjectAsJson.Contains("\"type\":\"error\"") || e.ParameterObjectAsJson.Contains("\"type\":\"warning\"")) problems.Add("CONSOLE " + e.ParameterObjectAsJson);
                    };
                    core.NavigationCompleted += async (s, e) => await SelfTestAsync(e.IsSuccess);
                }
                core.Navigate(Program.Origin + "/index.html");
            }
            catch (Exception ex)
            {
                if (!opts.SelfTest) MessageBox.Show(Texts.StartFailed + "\n\n" + ex.Message, "TastaturTrainer", MessageBoxButtons.OK, MessageBoxIcon.Error);
                WriteSelfTest(ex.ToString(), false);
                ExitCode = 4; Close();
            }
        }

        /* Dateien der Web-App direkt aus der EXE liefern (kein Dateisystem, kein Netzwerk) */
        private void OnWebResource(object sender, CoreWebView2WebResourceRequestedEventArgs e)
        {
            string path = Uri.UnescapeDataString(new Uri(e.Request.Uri).AbsolutePath).TrimStart('/');
            if (path.Length == 0) path = "index.html";
            if (files.TryGetValue(path, out byte[] data))
            {
                string headers = "Content-Type: " + Util.Mime(path) + "\r\nX-Content-Type-Options: nosniff\r\nCache-Control: no-store";
                e.Response = env.CreateWebResourceResponse(new MemoryStream(data, false), 200, "OK", headers);
            }
            else
            {
                e.Response = env.CreateWebResourceResponse(null, 404, "Not Found", "Content-Type: text/plain");
            }
        }

        /* ---------- automatischer Selbsttest (CI) ---------- */
        private async Task<string> Eval(string js) => await web.CoreWebView2.ExecuteScriptAsync(js);

        private async Task SelfTestAsync(bool navigated)
        {
            if (selfTestStarted) return;
            selfTestStarted = true;
            var log = new StringBuilder();
            bool pass = navigated;
            void Check(bool cond, string what) { log.AppendLine((cond ? "OK   " : "FAIL ") + what); pass &= cond; }
            try
            {
                string state = "";
                for (int i = 0; i < 50 && state != "\"profiles\""; i++) { await Task.Delay(100); state = await Eval("typeof BT === 'object' && BT.App ? BT.App.current : ''"); }
                Check(state == "\"profiles\"", "App gestartet (Profilauswahl)");
                Check(await Eval("BT.Store.storageInfo().kind") == "\"file\"", "Speicherung über Datei");
                await Eval("BT.App.closeModal(); BT.Store.create('Selftest', '🐱'); BT.App.applySettings(); BT.App.go('home'); 1");
                await Task.Delay(400);
                Check(File.Exists(opts.DataFile) && File.ReadAllText(opts.DataFile, Encoding.UTF8).Contains("Selftest"), "Profil in Datei gespeichert: " + opts.DataFile);
                await Eval("BT.Store.load(); BT.App.go('home'); 1");
                Check(await Eval("BT.Store.profile ? BT.Store.profile.name : ''") == "\"Selftest\"", "Profil aus Datei geladen");
                await Eval("BT.App.go('lessonIntro', 0); 1");
                await Task.Delay(300);
                Check(await Eval("document.querySelectorAll('.kb .key').length") != "0", "Lektion mit Bildschirm-Tastatur");
                await Eval("BT.Store.clearAll(); BT.App.go('profiles'); 1");
                await Task.Delay(200);
                Check(!File.Exists(opts.DataFile), "Alles löschen entfernt die Datei");
                await Eval("BT.Store.create('Selftest', '🐱'); BT.App.applySettings(); BT.App.go('home'); 1");
                await Task.Delay(800);
                using (var fs = File.Create(Path.Combine(opts.SelfTestDir, "screenshot.png")))
                    await web.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png, fs);
                Check(problems.Count == 0, "Keine JS-Fehler, Warnungen oder CSP-Verstöße" + (problems.Count > 0 ? ":\n  " + string.Join("\n  ", problems) : ""));
            }
            catch (Exception ex) { Check(false, "Ausnahme: " + ex); }
            WriteSelfTest(log.ToString(), pass);
            ExitCode = pass ? 0 : 1;
            Close();
        }

        private void WriteSelfTest(string text, bool pass)
        {
            if (!opts.SelfTest) return;
            try { File.WriteAllText(Path.Combine(opts.SelfTestDir, "selftest.log"), text + (pass ? "PASSED\n" : "FAILED\n"), new UTF8Encoding(false)); } catch { }
        }
    }

    /* ---------------- eingebettete Dateien ---------------- */
    internal static class Embedded
    {
        private static readonly Assembly Self = typeof(Embedded).Assembly;
        private static readonly Dictionary<string, Assembly> Loaded = new Dictionary<string, Assembly>(StringComparer.OrdinalIgnoreCase);

        public static byte[] Bytes(string name)
        {
            using (var s = Self.GetManifestResourceStream(name))
            {
                if (s == null) return null;
                using (var ms = new MemoryStream()) { s.CopyTo(ms); return ms.ToArray(); }
            }
        }

        public static Assembly ResolveAssembly(object sender, ResolveEventArgs e)
        {
            string name = new AssemblyName(e.Name).Name;
            lock (Loaded)
            {
                if (Loaded.TryGetValue(name, out Assembly a)) return a;
                byte[] bytes = Bytes("lib/" + name + ".dll");
                if (bytes == null) return null;
                a = Assembly.Load(bytes);
                Loaded[name] = a;
                return a;
            }
        }

        /* WebView2Loader.dll muss als Datei vorliegen: einmalig nach %LOCALAPPDATA% schreiben, Prüfsumme kontrollieren */
        public static string PrepareLoader()
        {
            byte[] bytes = Bytes("lib/WebView2Loader.dll");
            string hash = Util.Sha256Hex(bytes);
            string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "TastaturTrainer", "runtime", hash.Substring(0, 16));
            string file = Path.Combine(dir, "WebView2Loader.dll");
            Directory.CreateDirectory(dir);
            if (!File.Exists(file) || Util.Sha256Hex(File.ReadAllBytes(file)) != hash) File.WriteAllBytes(file, bytes);
            return dir;
        }

        public static Dictionary<string, byte[]> WebFiles()
        {
            var map = new Dictionary<string, byte[]>(StringComparer.Ordinal);
            foreach (string res in Self.GetManifestResourceNames())
            {
                if (!res.StartsWith("web/", StringComparison.Ordinal)) continue;
                map[res.Substring(4).Replace('\\', '/')] = Bytes(res);
            }
            return map;
        }
    }

    internal static class Util
    {
        public static string Sha256Hex(byte[] data)
        {
            using (var sha = SHA256.Create())
            {
                var sb = new StringBuilder();
                foreach (byte b in sha.ComputeHash(data)) sb.Append(b.ToString("x2", CultureInfo.InvariantCulture));
                return sb.ToString();
            }
        }

        public static bool IsWritable(string dir)
        {
            try
            {
                string probe = Path.Combine(dir, ".tt-schreibtest-" + Guid.NewGuid().ToString("N"));
                File.WriteAllText(probe, "");
                File.Delete(probe);
                return true;
            }
            catch { return false; }
        }

        public static string Mime(string path)
        {
            switch (Path.GetExtension(path).ToLowerInvariant())
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "text/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".png": return "image/png";
                case ".ico": return "image/x-icon";
                case ".json": return "application/json";
                default: return "application/octet-stream";
            }
        }
    }

    internal static class Texts
    {
        private static bool De => CultureInfo.CurrentUICulture.TwoLetterISOLanguageName == "de";

        public static string AlreadyRunning => De
            ? "Der TastaturTrainer läuft bereits."
            : "TastaturTrainer is already running.";

        public static string RuntimeMissing => De
            ? "Für den TastaturTrainer wird die „Microsoft Edge WebView2 Runtime“ benötigt. Sie ist bei Windows 10/11 normalerweise schon vorhanden – bitte ggf. die IT fragen.\n\nAlternativ funktioniert der TastaturTrainer auch direkt im Browser:\n" + Program.WebUrl
            : "TastaturTrainer needs the “Microsoft Edge WebView2 Runtime”. It is normally already installed on Windows 10/11 – please ask your IT if needed.\n\nAlternatively, TastaturTrainer also works directly in the browser:\n" + Program.WebUrl;

        public static string StartFailed => De
            ? "Der TastaturTrainer konnte nicht gestartet werden. Die Web-Version funktioniert im Browser:\n" + Program.WebUrl
            : "TastaturTrainer could not be started. The web version works in the browser:\n" + Program.WebUrl;
    }
}
