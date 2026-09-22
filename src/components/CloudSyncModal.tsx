import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  CloudUpload,
  RefreshCw,
  X,
  Check,
  BookOpen,
  User as UserIcon,
  LogOut,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Laptop,
} from "lucide-react";
import { User } from "firebase/auth";
import { NovelProject } from "../types";
import {
  signInWithGoogle,
  signOutGoogle,
  getCurrentUser,
  onAuthUserChanged,
  listCloudNovels,
  loadNovelFromCloud,
  deleteNovelFromCloud,
  CloudNovelSummary,
} from "../lib/firebase";

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: NovelProject;
  onLoadProject: (project: NovelProject) => void;
  lastSyncedAt: Date | null;
  syncStatus: "idle" | "saving" | "saved" | "error" | "offline";
  onTriggerSave: () => Promise<void>;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onLoadProject,
  lastSyncedAt,
  syncStatus,
  onTriggerSave,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cloudNovels, setCloudNovels] = useState<CloudNovelSummary[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [loadingNovelId, setLoadingNovelId] = useState<string | null>(null);
  const [deletingNovelId, setDeletingNovelId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsub = onAuthUserChanged((user) => {
      setCurrentUser(user);
      setActionError(null);
      if (isOpen) {
        loadList();
      }
    });
    return () => unsub();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActionError(null);
      loadList();
    }
  }, [isOpen]);

  const loadList = async () => {
    if (!getCurrentUser() || getCurrentUser()?.isAnonymous) {
      setCloudNovels([]);
      setIsLoadingList(false);
      return;
    }
    setIsLoadingList(true);
    setActionError(null);
    try {
      const list = await listCloudNovels();
      setCloudNovels(list);
    } catch (err: any) {
      console.warn("Error loading cloud list:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission-denied")) {
        setActionError("Permiso denegado al consultar las novelas. Verifica tu sesión.");
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    setActionError(null);
    try {
      await signInWithGoogle();
      loadList();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setAuthError(err?.message || "No se pudo iniciar sesión con Google");
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setIsAuthLoading(true);
    setActionError(null);
    try {
      await signOutGoogle();
      setCloudNovels([]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      handleGoogleSignIn();
      return;
    }
    setIsSavingManual(true);
    setActionError(null);
    try {
      await onTriggerSave();
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
      loadList();
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission-denied")) {
        setActionError("No tienes permisos para modificar este proyecto en la nube.");
      } else {
        setActionError("Ocurrió un error al guardar en la nube. Tus datos locales siguen a salvo.");
      }
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleSelectNovel = async (novelId: string) => {
    if (novelId === currentProject.id) {
      onClose();
      return;
    }
    setLoadingNovelId(novelId);
    setActionError(null);
    try {
      const loaded = await loadNovelFromCloud(novelId);
      if (loaded) {
        onLoadProject(loaded);
        onClose();
      }
    } catch (err: any) {
      console.error("Error loading cloud novel:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission-denied")) {
        setActionError("No tienes permiso para acceder a esta novela o pertenece a otra cuenta.");
      } else {
        setActionError("No se pudo cargar la novela desde la nube.");
      }
    } finally {
      setLoadingNovelId(null);
    }
  };

  const handleDeleteFromCloud = async (novelId: string, title: string) => {
    if (
      !window.confirm(
        `¿Eliminar la copia en la nube de "${title}"? Esta acción solo eliminará la copia alojada en la nube, no afectará tu versión local.`
      )
    ) {
      return;
    }
    setDeletingNovelId(novelId);
    setActionError(null);
    try {
      await deleteNovelFromCloud(novelId);
      loadList();
    } catch (err: any) {
      console.error("Error deleting novel from cloud:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission-denied")) {
        setActionError("No tienes permiso para eliminar esta novela.");
      } else {
        setActionError(err?.message || "No se pudo eliminar la copia en la nube.");
      }
    } finally {
      setDeletingNovelId(null);
    }
  };

  if (!isOpen) return null;

  const formattedLastSync = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        style={{ color: "var(--text-main)" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shadow-2xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-novel-display flex items-center gap-2">
                <span>Sincronización en la Nube & Cuenta Google</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Accede a tus proyectos, manuscrito y codex desde cualquier dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Google Account Section */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 shadow-2xs">
            {currentUser && !currentUser.isAnonymous ? (
              // Connected with Google State
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "Usuario"}
                      className="w-10 h-10 rounded-full border border-[var(--border-color)] object-cover shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-sm shadow-2xs">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                    </div>
                  )}
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs truncate max-w-[200px]">
                        {currentUser.displayName || "Usuario de Google"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        Google Activo
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[240px]">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={handleGoogleSignOut}
                    disabled={isAuthLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-red-500 text-xs font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              // Not Signed In with Google State
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-[var(--text-main)]">
                      Sincroniza tus novelas entre dispositivos
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Inicia sesión con tu cuenta de Google para respaldar tus obras y abrirlas en tu ordenador portátil, tablet o teléfono móvil desde cualquier navegador.
                    </p>
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
                  >
                    {isAuthLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-600" />
                    ) : (
                      <GoogleIcon className="w-4 h-4" />
                    )}
                    <span>Iniciar sesión con Google</span>
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Rápido, seguro y sin contraseñas extra
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner if any cloud action failed */}
          {actionError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                onClick={() => setActionError(null)}
                className="text-[10px] underline hover:no-underline shrink-0"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Current Project Synchronization Card */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {!currentUser || currentUser.isAnonymous ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Modo local (Sin sincronización activa)</span>
                  </>
                ) : syncStatus === "saving" || isSavingManual ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
                    <span>Sincronizando con la nube...</span>
                  </>
                ) : syncStatus === "saved" || saveSuccessMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Copia en la nube actualizada
                    </span>
                  </>
                ) : syncStatus === "offline" ? (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">
                      Modo sin conexión (guardado seguro localmente)
                    </span>
                  </>
                ) : syncStatus === "error" ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">
                      Sin sincronizar recientemente
                    </span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Novela actual lista para la nube</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                <span>«{currentProject.title}»</span>
                <span>•</span>
                {!currentUser || currentUser.isAnonymous ? (
                  <span>Guardado seguro localmente en tu navegador</span>
                ) : (
                  <>
                    <span>{formattedLastSync ? `Último guardado: ${formattedLastSync}` : "Listo"}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sincronización automática activa
                    </span>
                  </>
                )}
              </p>
            </div>

            <button
              onClick={handleManualSave}
              disabled={isSavingManual || syncStatus === "saving"}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-bold text-xs hover:opacity-90 transition-all shadow-xs shrink-0 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4 text-[var(--accent-contrast)]" />
              <span>
                {!currentUser || currentUser.isAnonymous
                  ? "Conectar para Subir"
                  : isSavingManual
                  ? "Guardando..."
                  : "Subir / Respaldar Ahora"}
              </span>
            </button>
          </div>

          {/* Cloud Projects List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Proyectos disponibles en tu nube</span>
              </span>
              {currentUser && !currentUser.isAnonymous && (
                <button
                  onClick={loadList}
                  disabled={isLoadingList}
                  className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1"
                  title="Actualizar lista"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingList ? "animate-spin" : ""}`} />
                  <span>Actualizar</span>
                </button>
              )}
            </div>

            {!currentUser || currentUser.isAnonymous ? (
              <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] text-center text-[var(--text-muted)] space-y-2">
                <ShieldCheck className="w-6 h-6 mx-auto text-[var(--accent)] opacity-60" />
                <p className="font-semibold text-xs text-[var(--text-main)]">
                  Tus proyectos en la nube son privados y seguros
                </p>
                <p className="text-[11px]">
                  Inicia sesión con tu cuenta de Google arriba para ver y abrir tus novelas sincronizadas.
                </p>
              </div>
            ) : isLoadingList ? (
              <div className="p-8 text-center text-[var(--text-muted)] flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[var(--accent)] opacity-60" />
                <span className="text-xs">Consultando proyectos en tu nube...</span>
              </div>
            ) : cloudNovels.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[var(--border-color)] text-center text-[var(--text-muted)] space-y-1">
                <p>No hay novelas guardadas aún en tu cuenta de la nube.</p>
                <p className="text-[10px]">
                  Haz clic en «Subir / Respaldar Ahora» para guardar tu novela actual.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cloudNovels.map((novel) => {
                  const isCurrent = novel.id === currentProject.id;
                  const dateStr = novel.updatedAt
                    ? new Date(novel.updatedAt).toLocaleDateString([], {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Fecha desconocida";

                  return (
                    <div
                      key={novel.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "border-[var(--accent)] bg-[var(--accent-subtle)]/30 shadow-2xs"
                          : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/60"
                      }`}
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-xs truncate">
                            {novel.title}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[var(--accent)] text-[var(--accent-contrast)] shrink-0">
                              Activa
                            </span>
                          )}
                          {novel.isOwnedByCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                              Tu cuenta Google
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 truncate">
                          <span>{novel.author || "Sin autor"}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                          {novel.userEmail && !novel.isOwnedByCurrentUser && (
                            <>
                              <span>•</span>
                              <span className="opacity-75 truncate">Por {novel.userEmail}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSelectNovel(novel.id)}
                          disabled={isCurrent || loadingNovelId === novel.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isCurrent
                              ? "text-[var(--text-muted)] opacity-50 cursor-default"
                              : "border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          {loadingNovelId === novel.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : isCurrent ? (
                            "Abierta"
                          ) : (
                            "Abrir"
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteFromCloud(novel.id, novel.title)}
                          disabled={deletingNovelId === novel.id}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Eliminar esta copia de la nube"
                        >
                          {deletingNovelId === novel.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cross-device advice */}
          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-start gap-2.5">
            <Laptop className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-[var(--text-main)]">
                Acceso multiplataforma:
              </span>
              <p className="leading-relaxed">
                Abre esta misma aplicación en cualquier otro navegador o dispositivo e inicia sesión con tu cuenta de Google para descargar y continuar escribiendo tus proyectos con todas las posiciones del mapa y tus notas intactas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] flex justify-end bg-[var(--bg-surface)]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
