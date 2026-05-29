// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the MIT Licence.
// See the LICENCE file in the repository root for full licence text.

using System.Collections.Generic;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using osu.Framework.Bindables;
using osu.Framework.Extensions.TypeExtensions;
using osu.Game.Configuration;
using osu.Game.Extensions;
using osu.Game.Rulesets;
using osu.Game.Rulesets.Catch;
using osu.Game.Rulesets.Mania;
using osu.Game.Rulesets.Mods;
using osu.Game.Rulesets.Osu;
using osu.Game.Rulesets.Taiko;

namespace ModDefaultSettingsExporter;

public static class Program
{
    private static readonly JsonSerializerOptions json_options = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public static int Main(string[] args)
    {
        string outputPath = Path.Combine(Directory.GetCurrentDirectory(), "default_settings.json");

        for (int i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "-o":
                case "--output":
                    if (i + 1 >= args.Length)
                    {
                        Console.Error.WriteLine("Missing value for --output.");
                        return 1;
                    }

                    outputPath = Path.GetFullPath(args[++i]);
                    break;

                case "-h":
                case "--help":
                    printUsage();
                    return 0;
            }
        }

        var export = new Dictionary<string, Dictionary<string, Dictionary<string, SettingExport>>>(StringComparer.Ordinal);

        foreach (var ruleset in getLegacyRulesets())
        {
            var modDefaults = new Dictionary<string, Dictionary<string, SettingExport>>(StringComparer.Ordinal);

            foreach (var mod in ruleset.CreateAllMods())
            {
                var settings = getDefaultSettings(mod);

                if (settings.Count == 0)
                    continue;

                modDefaults[mod.Acronym] = settings;
            }

            export[ruleset.RulesetInfo.ShortName] = modDefaults;
        }

        var document = new ExportDocument
        {
            GeneratedAt = DateTimeOffset.UtcNow,
            Rulesets = export,
        };

        File.WriteAllText(outputPath, JsonSerializer.Serialize(document, json_options));
        Console.WriteLine($"Wrote mod default settings to {outputPath}");
        return 0;
    }

    private static IEnumerable<Ruleset> getLegacyRulesets()
    {
        yield return new OsuRuleset();
        yield return new TaikoRuleset();
        yield return new CatchRuleset();
        yield return new ManiaRuleset();
    }

    private static Dictionary<string, SettingExport> getDefaultSettings(Mod mod)
    {
        var settings = new Dictionary<string, SettingExport>(StringComparer.Ordinal);

        foreach (var (_, property) in mod.GetSettingsSourceProperties())
        {
            var bindable = (IBindable)property.GetValue(mod)!;
            settings[property.Name.ToSnakeCase()] = buildSettingExport(bindable);
        }

        return settings;
    }

    private static SettingExport buildSettingExport(IBindable bindable)
    {
        var export = new SettingExport
        {
            Default = serializeDefault(bindable),
        };

        Type? valueType = getBindableValueType(bindable);

        if (valueType?.IsEnum == true)
            export.Options = Enum.GetNames(valueType);

        switch (bindable)
        {
            case BindableNumber<double> bindableDouble:
                export.Min = bindableDouble.MinValue;
                export.Max = bindableDouble.MaxValue;
                export.Precision = bindableDouble.Precision;
                break;

            case BindableNumber<float> bindableFloat:
                export.Min = bindableFloat.MinValue;
                export.Max = bindableFloat.MaxValue;
                export.Precision = bindableFloat.Precision;
                break;

            case BindableNumber<int> bindableInt:
                export.Min = bindableInt.MinValue;
                export.Max = bindableInt.MaxValue;
                export.Precision = bindableInt.Precision;
                break;

            case DifficultyBindable difficultyBindable:
                export.Min = difficultyBindable.MinValue;
                export.Max = difficultyBindable.MaxValue;
                break;
        }

        return export;
    }

    private static object? serializeDefault(IBindable bindable)
    {
        object? defaultValue = getBindableDefault(bindable);

        if (defaultValue == null)
            return null;

        return defaultValue switch
        {
            Enum enumValue => enumValue.ToString(),
            bool or int or long or float or double => defaultValue,
            _ => defaultValue,
        };
    }

    private static object? getBindableDefault(IBindable bindable)
    {
        Type? bindableType = bindable.GetType().EnumerateBaseTypes()
            .SingleOrDefault(t => t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Bindable<>));

        if (bindableType != null)
            return bindableType.GetProperty(nameof(Bindable<object>.Default), BindingFlags.Public | BindingFlags.Instance)?.GetValue(bindable);

        return bindable.GetUnderlyingSettingValue();
    }

    private static Type? getBindableValueType(IBindable bindable)
    {
        return bindable.GetType().GetInterfaces()
            .FirstOrDefault(t => t.IsGenericType && t.GetGenericTypeDefinition() == typeof(IBindable<>))
            ?.GenericTypeArguments[0];
    }

    private static void printUsage()
    {
        Console.WriteLine("Usage: dotnet run --project Tools/ModDefaultSettingsExporter [--output <path>]");
        Console.WriteLine();
        Console.WriteLine("Exports default values for all mod settings to JSON.");
        Console.WriteLine("Defaults are read from each mod's [SettingSource] bindable Default property.");
        Console.WriteLine("Enum settings include all selectable options; numeric settings include min/max/precision when defined.");
    }

    private sealed class SettingExport
    {
        [JsonPropertyName("default")]
        public object? Default { get; set; }

        [JsonPropertyName("options")]
        public IReadOnlyList<string>? Options { get; set; }

        [JsonPropertyName("min")]
        public object? Min { get; set; }

        [JsonPropertyName("max")]
        public object? Max { get; set; }

        [JsonPropertyName("precision")]
        public object? Precision { get; set; }
    }

    private sealed class ExportDocument
    {
        [JsonPropertyName("generated_at")]
        public DateTimeOffset GeneratedAt { get; set; }

        [JsonPropertyName("rulesets")]
        public Dictionary<string, Dictionary<string, Dictionary<string, SettingExport>>> Rulesets { get; set; } = null!;
    }
}
