using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using personalSiteWebAssembly;
using personalSiteWebAssembly.Helpers;
using System.Net.Http;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// Existing HttpClient registration
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

// Register WebPages so it can be injected into components/layouts
builder.Services.AddSingleton<WebPages>();

await builder.Build().RunAsync();
