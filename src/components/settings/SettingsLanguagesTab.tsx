import React, { useState } from "react";
import { Check, Globe, Sparkles } from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  isAvailable: boolean;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "es",
    name: "Español",
    nativeName: "Español",
    region: "España e Hispanoamérica",
    isAvailable: true,
  },
  {
    code: "en",
    name: "Inglés",
    nativeName: "English",
    region: "United States / United Kingdom",
    isAvailable: false,
  },
  {
    code: "fr",
    name: "Francés",
    nativeName: "Français",
    region: "France / Canada / Belgique",
    isAvailable: false,
  },
  {
    code: "de",
    name: "Alemán",
    nativeName: "Deutsch",
    region: "Deutschland / Österreich / Schweiz",
    isAvailable: false,
  },
  {
    code: "pt",
    name: "Portugués",
    nativeName: "Português",
    region: "Brasil / Portugal",
    isAvailable: false,
  },
];

export const SettingsLanguagesTab: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("es");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-[var(--accent)]" />
        <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
          Idioma de la Interfaz
        </h4>
      </div>

      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        Selecciona el idioma principal de trabajo. Las traducciones completas para lenguas adicionales se incorporarán progresivamente en futuras versiones.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;

          return (
            <div
              key={lang.code}
              onClick={() => {
                if (lang.isAvailable) {
                  setSelectedLanguage(lang.code);
                }
              }}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between select-none ${
                lang.isAvailable
                  ? "cursor-pointer hover:border-[var(--accent)]/50 bg-[var(--bg-input)]"
                  : "opacity-60 cursor-not-allowed bg-[var(--bg-input)]/50"
              } ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)]/20 shadow-2xs"
                  : "border-[var(--border-color)]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "bg-black/5 dark:bg-white/5 text-[var(--text-muted)]"
                  }`}
                >
                  {lang.code.toUpperCase()}
                </div>

                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-2">
                    <span>{lang.nativeName}</span>
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      ({lang.name})
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {lang.region}
                  </div>
                </div>
              </div>

              <div>
                {lang.isAvailable ? (
                  isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)]">
                      <Check className="w-3 h-3" />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)]">
                      Seleccionar
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono">
                    <Sparkles className="w-2.5 h-2.5 opacity-60" />
                    <span>Próximamente</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
