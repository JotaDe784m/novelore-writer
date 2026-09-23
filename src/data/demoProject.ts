import { NovelProject } from "../types";

export const initialDemoProject: NovelProject = {
  id: "proj-sombras-alcaraz",
  title: "El Susurro del Cristal de Sombras",
  subtitle: "Crónicas de la Resonancia — Libro I",
  author: "J. B. Alcaraz",
  genre: "Fantasía Oscura / Intriga Política",
  logline:
    "Una cartógrafa de artefactos antiguos descubre que el cristal que alimenta la ciudadela levita gracias a las memorias robadas de los desaparecidos.",
  synopsis:
    "En la Ciudadela de Éter, donde la magia se mide en pulsos lumínicos, Valeria Vance sobrevive descifrando sellos arcanos prohibidos. Cuando su mentor desaparece dejando solo un diario carbonizado y un fragmento de cristal sombrío, Valeria debe aliarse con Alistair, un inquisidor caído en desgracia, para desenmascarar la conspiración de la Archiduquesa Morvath antes del Gran Alineamiento.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDemo: true,
  settings: {
    targetTotalWords: 65000,
    dialogueStyle: "dash",
    fontFamily: "serif",
    fontSize: 18,
    lineSpacing: "relaxed",
    typewriterMode: false,
    focusMode: false,
    theme: "minimal",
  },
  acts: [
    {
      id: "act-1",
      title: "Acto I: El Eco del Prisma Roto",
      description: "El statu quo en la Ciudadela y el descubrimiento del diario.",
      order: 1,
      chapters: [
        {
          id: "chap-1",
          actId: "act-1",
          title: "Capítulo 1: Tinta y Cenizas",
          description: "Valeria encuentra el taller saqueado de su mentor.",
          order: 1,
          scenes: [
            {
              id: "scene-1",
              chapterId: "chap-1",
              title: "Escena 1: La cerradura sin llave",
              content: `La lluvia ácida repiqueteaba contra los vitrales emplomados del taller con la insistencia de un acreedor impaciente.

Valeria sopló la viruta de cobre que cubría la mesa de trabajo. Entre los engranajes calcinados del astrolabio, un destello púrpura palpitaba al compás de su propio pulso.

—Llegas tarde, Vance —dijo una voz desde la penumbra de la escalera.

Valeria no se giró de inmediato. Deslizó los dedos hacia la daga de plata oculta bajo el mandil de cuero antes de fijar la mirada en la silueta.

—La niebla está densa en los muelles —respondió ella, alzando la barbilla—. Además, no recordaba haberte dado permiso para entrar en el santuario del maestro Orestes.

Alistair dio un paso hacia el círculo de luz de la lámpara de aceite. Su uniforme de inquisidor estaba despojado de insignias doradas, y la cicatriz que le cruzaba la sien aún lucía enrojecida por el fuego alquímico.

—Orestes no volverá a reclamar este lugar —murmuró él, arrojando sobre la mesa un fragmento de pergamino chamuscado con el sello de la Orden—. Descubrió los manuscritos prohibidos sobre La Purga de los Tejedores de Luz. Los centinelas de Morvath se lo llevaron antes del toque de queda. Y si no descifras esto antes del amanecer, seremos los siguientes.`,
              synopsis:
                "Valeria descubre el fragmento del diario de Orestes en el taller saqueado y es confrontada por Alistair.",
              notes:
                "Establecer la tensión inicial y la desconfianza entre Valeria y Alistair. Destacar el sonido de la lluvia y el olor a cobre quemado.",
              status: "polished",
              povCharacterId: "char-valeria",
              characterIds: ["char-valeria", "char-alistair"],
              locationId: "loc-taller",
              goal: "Terminar la catalogación del astrolabio sin levantar sospechas.",
              conflict:
                "Alistair interrumpe con la noticia del secuestro de Orestes.",
              outcome:
                "Valeria acepta examinar el pergamino chamuscado y pacta una tregua temporal.",
              targetWordCount: 1500,
              wordCount: 195,
              timelineEventId: "evt-1",
              historicalEventIds: ["event-purga"],
              order: 1,
            },
            {
              id: "scene-2",
              chapterId: "chap-1",
              title: "Escena 2: El pacto del Cuervo",
              content: `La taberna El Cuervo Plateado olía a cerveza rancia, tabaco de pipa y conspiraciones mal disimuladas.

En el rincón más alejado del hogar encendido, Damián Kael contaba monedas de plata con la agilidad de quien ha robado tantas veces que sus dedos tienen memoria propia.

—Un inquisidor renegado y una cartógrafa de reliquias entran a una taberna —dijo Damián sin levantar la vista—. Suena al comienzo de una mala ejecución en la plaza pública.

—Necesitamos paso seguro por las Catacumbas Bajas —atajó Valeria, plantando ambas manos sobre la mesa de roble—. Y sabemos que tú eres el único con los salvoconductos del Bajo Distrito.

Damián alzó una ceja, deteniendo una moneda en el aire. Sus ojos dorados reflejaron las llamas del candil.

—Las Catacumbas no son seguras desde que la Archiduquesa reforzó las patrullas mecánicas —dijo en voz baja—. El precio no son monedas esta noche, Vance. Quiero saber qué contiene la caja que Orestes escondió bajo el altar del sol.`,
              synopsis:
                "Valeria y Alistair negocian un salvoconducto con Damián en los bajos fondos.",
              notes:
                "Mostrar la habilidad de Damián para percibir secretos y su pasado con Valeria.",
              status: "draft",
              povCharacterId: "char-valeria",
              characterIds: ["char-valeria", "char-alistair", "char-damian"],
              locationId: "loc-taberna",
              goal: "Conseguir acceso a las catacumbas antes del toque de queda.",
              conflict: "Damián exige información sobre el secreto de Orestes.",
              outcome:
                "Aceptan llevar a Damián con ellos a cambio de su red de túneles.",
              targetWordCount: 1800,
              wordCount: 184,
              timelineEventId: "evt-2",
              order: 2,
            },
          ],
        },
        {
          id: "chap-2",
          actId: "act-1",
          title: "Capítulo 2: Voces en la Niebla",
          description: "La incursión en los túneles subterráneos de la ciudad.",
          order: 2,
          scenes: [
            {
              id: "scene-3",
              chapterId: "chap-2",
              title: "Escena 1: El umbral de las catacumbas",
              content: `El aire frío de los subterráneos sabía a salitre y piedra húmeda.

Valeria ajustó la correa de su mochila de cartografía. Cada paso resonaba con un eco sordo que parecía multiplicarse en la oscuridad de los arcos ojivales.

—Cuidado donde pisáis —advirtió Damián, señalando con la punta de su bastón una hilera de runas fosforescentes grabadas en el suelo—. Los autómatas de la Orden no distinguen entre un ladrón y un sacerdote fuera de horario.

Alistair desenfundó su espada de hoja ancha. El metal emitió un zumbido azulado al detectar la proximidad de energía etérea.

—Hay alguien más aquí abajo —susurró el inquisidor—. Y no respiran como los vivos.`,
              synopsis:
                "El trío desciende a las catacumbas y activa accidentalmente una alarma de resonancia.",
              notes: "Aumentar la sensación de peligro inminente y claustrofobia.",
              status: "draft",
              povCharacterId: "char-valeria",
              characterIds: ["char-valeria", "char-alistair", "char-damian"],
              locationId: "loc-catacumbas",
              goal: "Llegar a la bóveda sellada sin alertar a los guardias.",
              conflict: "Las trampas rúnicas están activas y alteradas.",
              outcome:
                "Descubren que las runas responden a la presencia del cristal sombrío.",
              targetWordCount: 2000,
              wordCount: 128,
              timelineEventId: "evt-3",
              order: 1,
            },
          ],
        },
      ],
    },
    {
      id: "act-2",
      title: "Acto II: La Máquina de Almas",
      description: "El viaje al corazón de la conspiración y la verdad sobre el cristal.",
      order: 2,
      chapters: [
        {
          id: "chap-3",
          actId: "act-2",
          title: "Capítulo 3: El Núcleo de Resonancia",
          description: "Infiltración en el templo superior de la Ciudadela.",
          order: 1,
          scenes: [
            {
              id: "scene-4",
              chapterId: "chap-3",
              title: "Escena 1: El suspiro de los cautivos",
              content: `La cámara central no tenía paredes de piedra ordinaria; eran muros de cristal líquido que contenían filamentos dorados en constante convulsión.

Valeria se detuvo en seco, con el aliento atrapado en la garganta. Al tocar la superficie fría del cristal, una marea de voces ajenas inundó su mente: plegarias, despedidas, nombres olvidados.

—No es una fuente de energía mineral —dijo ella, con lágrimas de estupor nublando su visión—. Es una colmena de memorias. La ciudad entera está encendida con el dolor de los que desaparecieron.

Desde el balcón superior, el sonido de aplausos ceremoniales rompió la atmósfera.

—Felicidades, pequeña Vance —dijo la Archiduquesa Morvath, asomándose envuelta en sedas negras y gemas de ónice—. Has llegado justo a tiempo para alimentar el próximo ciclo.`,
              synopsis:
                "Valeria descubre la perturbadora verdad: el cristal absorbe las memorias de los ciudadanos para alimentar la metrópoli.",
              notes: "Punto de giro crucial (Midpoint). Máxima revelación emocional.",
              status: "idea",
              povCharacterId: "char-valeria",
              characterIds: ["char-valeria", "char-morvath", "char-alistair"],
              locationId: "loc-nucleo",
              goal: "Desactivar el conducto de energía del distrito alto.",
              conflict: "Morvath los embosca con la guardia de élite.",
              outcome:
                "Alistair es capturado y Valeria debe huir con el fragmento original.",
              targetWordCount: 2500,
              wordCount: 139,
              timelineEventId: "evt-4",
              order: 1,
            },
          ],
        },
      ],
    },
    {
      id: "act-3",
      title: "Acto III: El Eclipse de Cristal",
      description: "La confrontación final durante el Gran Alineamiento.",
      order: 3,
      chapters: [
        {
          id: "chap-4",
          actId: "act-3",
          title: "Capítulo 4: El Despertar de la Aurora",
          description: "La liberación de las almas y la caída de la torre central.",
          order: 1,
          scenes: [
            {
              id: "scene-5",
              chapterId: "chap-4",
              title: "Escena 1: La elección del cartógrafo",
              content: `El viento de la cúspide soplaba con furia de tormenta.

Con el prisma roto en una mano y el astrolabio grabado en la otra, Valeria miró hacia el abismo de luces de la Ciudadela. Destruir el cristal significaba liberar a las almas atrapadas, pero también apagar la magia que sostenía las islas flotantes.

—Si lo rompes, caeremos todos —gritó Morvath con la voz desgarrada por el pánico.

—No caeremos —susurró Valeria, clavando la aguja de plata en el corazón del prisma—. Aprenderemos a caminar sobre la tierra de nuevo.`,
              synopsis:
                "Clímax de la novela: Valeria toma la decisión irrevocable de fracturar el prisma.",
              notes: "Resolución del dilema moral planteado en el Acto I.",
              status: "idea",
              povCharacterId: "char-valeria",
              characterIds: ["char-valeria", "char-morvath"],
              locationId: "loc-torre",
              goal: "Liberar a los cautivos y detener el ritual de alineamiento.",
              conflict: "La destrucción del cristal amenaza con derrumbar la ciudad.",
              outcome:
                "El cristal se fractura en miles de chispas benignas y la dictadura cae.",
              targetWordCount: 3000,
              wordCount: 104,
              timelineEventId: "evt-5",
              order: 1,
            },
          ],
        },
      ],
    },
  ],
  entities: [
    {
      id: "char-valeria",
      category: "character",
      name: "Valeria Vance",
      subtitle: "Cartógrafa de Reliquias & Erudita Proscrita",
      summary:
        "Joven investigadora con la habilidad innata de sentir los ecos de resonancia en metales y gemas antiguas. Creció como aprendiz de Orestes.",
      tags: ["Protagonista", "Erudita", "Magia Sensitiva"],
      aliases: ["Valeria", "Vance", "Val"],
      color: "#3b82f6",
      avatarIcon: "User",
      attributes: {
        Rol: "Protagonista Principal",
        Edad: "24 años",
        Motivación: "Encontrar la verdad sobre la desaparición de su hermano y salvar a Orestes.",
        "Mayor Miedo": "Perder sus propios recuerdos por la exposición al cristal.",
        "Secreto Inconfesable": "Ella misma activó involuntariamente el primer sello del prisma cuando era niña.",
        "Rasgo Físico": "Pelo castaño recogido con punzones de bronce, ojos grises inquisitivos.",
      },
      notes:
        "Su arco va de la neutralidad académica y la cautela a liderar una insurrección moral.",
    },
    {
      id: "char-alistair",
      category: "character",
      name: "Alistair Thorne",
      subtitle: "Ex Inquisidor de la Orden del Prisma",
      summary:
        "Guerrero entrenado en el combate con armas imbuidas en resonancia. Fue expulsado de la Orden tras negarse a ejecutar a disidentes civiles.",
      tags: ["Coprotagonista", "Espadachín", "Redención"],
      aliases: ["Alistair", "Thorne", "Inquisidor"],
      color: "#ef4444",
      avatarIcon: "Shield",
      attributes: {
        Rol: "Aliado / Co-protagonista",
        Edad: "31 años",
        Motivación: "Expiar sus crímenes pasados protegiendo a los inocentes que la Orden persigue.",
        "Mayor Miedo": "Convertirse en un autómata ciego a las órdenes de Morvath.",
        "Secreto Inconfesable": "Fue él quien arrestó al hermano de Valeria hace cinco años por orden superior.",
        "Rasgo Físico": "Cicatriz de fuego alquímico en la sien izquierda, porte militar rígido.",
      },
      notes: "Tensión dramática constante con Valeria por los secretos del pasado.",
    },
    {
      id: "char-damian",
      category: "character",
      name: "Damián Kael",
      subtitle: "Jefe de Contrabando de los Bajos Fondos",
      summary:
        "Ladrón carismático y maestro de los pasadizos secretos de la Ciudadela. Lealtad flexible pero con un código ético oculto.",
      tags: ["Secundario", "Pícaro", "Contactos"],
      aliases: ["Damián", "Kael"],
      color: "#f59e0b",
      avatarIcon: "Key",
      attributes: {
        Rol: "Aliado ambiguo / Guía",
        Edad: "27 años",
        Motivación: "Acumular suficientes riquezas e influencias para comprar su propia flota mercante.",
        "Mayor Miedo": "Ser encerrado de por vida en las mazmorras sin ver el cielo.",
        "Secreto Inconfesable": "Está enamorado en secreto de Valeria desde sus días de infancia en el puerto.",
        "Rasgo Físico": "Sonrisa socarrona, abrigo de cuero parcheado con seda de contrabando.",
      },
      notes: "Aporta humor cínico, agilidad táctica y contactos en el submundo.",
    },
    {
      id: "char-morvath",
      category: "character",
      name: "Archiduquesa Morvath",
      subtitle: "Soberana de la Ciudadela de Éter",
      summary:
        "Gobernante implacable que cree que el fin justifica los medios para mantener la civilización a flote contra la penumbra del vacío exterior.",
      tags: ["Antagonista", "Gobernante", "Poder Político"],
      aliases: ["Morvath", "Archiduquesa"],
      color: "#8b5cf6",
      avatarIcon: "Crown",
      attributes: {
        Rol: "Antagonista Principal",
        Edad: "52 años",
        Motivación: "Evitar el colapso gravitatorio de la Ciudadela a cualquier coste humano.",
        "Mayor Miedo": "Que el pueblo descubra que su linaje no tiene sangre divina.",
        "Secreto Inconfesable": "Su propia longevidad proviene del drenaje selectivo de memorias nobles.",
        "Rasgo Físico": "Ojos violetas sobrenaturales, joyas de ónice negro talladas con sellos arcanos.",
      },
      notes: "Villana tridimensional con una lógica fría y utilitarista difícil de rebatir.",
    },
    {
      id: "loc-ciudadela",
      category: "location",
      name: "Ciudadela de Éter",
      subtitle: "Capital Flotante de los Tres Anillos",
      summary:
        "Una metrópoli suspendida sobre el vacío por motores de levitación cristalina. Dividida entre la Ciudad Alta dorada y los Bajos Muelles contaminados.",
      tags: ["Capital", "Ciudad Flotante", "Steampunk/Fantasía"],
      aliases: ["Ciudadela", "Éter"],
      color: "#06b6d4",
      avatarIcon: "Building",
      attributes: {
        Tipo: "Metrópoli flotante",
        Población: "350,000 habitantes",
        Clima: "Brumoso, húmedo con lluvias ácidas frecuentes",
        Peligro: "Patrullas de autómatas de resonancia y caídas al vacío",
      },
      notes: "El contraste entre el lujo de los anillos superiores y la miseria de abajo es central.",
    },
    {
      id: "loc-taberna",
      category: "location",
      name: "Taberna El Cuervo Plateado",
      subtitle: "Refugio Neutral del Distrito Portuario",
      summary:
        "Antiguo almacén naval convertido en punto de encuentro clandestino para contrabandistas, eruditos prófugos y mercenarios.",
      tags: ["Bajos Fondos", "Lugar de Encuentro"],
      color: "#eab308",
      avatarIcon: "Beer",
      attributes: {
        Dueño: "Damián Kael (a través de testaferros)",
        Seguridad: "Regla sagrada de no desenvainar acero dentro del local",
        Atmósfera: "Humo de tabaco dulce, luz ámbar de candiles de aceite",
      },
      notes: "Escenario del pacto inicial en el Acto I.",
    },
    {
      id: "loc-catacumbas",
      category: "location",
      name: "Catacumbas Bajas & Canales Rúnicos",
      subtitle: "El Laberinto Olvidado de los Primeros Constructores",
      summary:
        "Kilómetros de conductos hidráulicos y criptas milenarias por donde fluyen los efluvios residuales de la energía de resonancia.",
      tags: ["Mazmorra", "Subterráneo", "Peligroso"],
      color: "#64748b",
      avatarIcon: "MapPin",
      attributes: {
        Profundidad: "400 metros bajo el nivel de la calle",
        Peligro: "Autómatas centinelas abandonados y bolsas de gas etéreo",
      },
      notes: "Conecta los distritos sin pasar por los puestos de guardia oficiales.",
    },
    {
      id: "item-prisma",
      category: "item",
      name: "El Prisma de Sombras",
      subtitle: "Reliquia de la Primera Era de Resonancia",
      summary:
        "Un octaedro de cuarzo violeta oscuro que atrapa los recuerdos y la fuerza vital en forma de luz armónica.",
      tags: ["Artefacto", "Magia Oscura", "Clave de Trama"],
      color: "#ec4899",
      avatarIcon: "Gem",
      attributes: {
        Origen: "Forjado por los Tejedores Primordiales",
        Poder: "Almacena millones de horas de memoria humana y genera energía cinética",
        Coste: "Degrada la salud mental de quien lo porte sin guanteletes de plomo",
      },
      notes: "El catalizador de todo el conflicto de la novela.",
    },
    {
      id: "fac-orden",
      category: "faction",
      name: "La Orden del Prisma Sagrado",
      subtitle: "Brazo Religioso y Militar de la Archiduquesa",
      summary:
        "Caballeros inquisidores y alquimistas de Estado dedicados a la recolección forzosa de diezmos de memoria para alimentar la ciudadela.",
      tags: ["Facción Militar", "Antagonistas", "Dogma"],
      color: "#6366f1",
      avatarIcon: "ShieldAlert",
      attributes: {
        Líder: "Gran Canciller Vane",
        Cuartel: "El Bastión de Marfil",
        Lema: "'De la memoria individual nace la eternidad del Todo'",
      },
      notes: "Alistair pertenecía a esta facción antes de rebelarse.",
    },
    {
      id: "concept-resonancia",
      category: "concept",
      name: "Magia de Resonancia",
      subtitle: "Sistema de Magia Basado en Frecuencias Emocionales",
      summary:
        "Técnica arcana que convierte las emociones intensas y memorias vívidas en trabajo mecánico y campos de repulsión gravitatoria.",
      tags: ["Sistema Mágico", "Leyes del Mundo"],
      color: "#10b981",
      avatarIcon: "Zap",
      attributes: {
        Tipo: "Sistema de Magia Dura (Hard Magic)",
        Regla_1: "Solo los recuerdos con alto peso emocional producen energía útil",
        Regla_2: "Una vez consumido el recuerdo en el reactor, el individuo lo olvida para siempre",
        Peligro: "Síndrome de la mente hueca en las víctimas de extracción",
      },
      notes: "La base ética y técnica de todo el conflicto mundial.",
    },
    {
      id: "event-purga",
      category: "event",
      name: "La Purga de los Tejedores de Luz",
      subtitle: "Acontecimiento Histórico de la Primera Era",
      summary:
        "El golpe de Estado y rebelión arcana en el que la Orden del Prisma erradicó al gremio de tejedores libres, confiscando el Prisma Primordial para alimentar la Ciudadela.",
      tags: ["Historia Antigua", "Guerra Civil", "Secreto de Estado", "Cisma"],
      aliases: ["La Purga", "La Purga de los Tejedores", "Caída de los Tejedores"],
      color: "#f97316",
      avatarIcon: "Calendar",
      isHistorical: true,
      dateOrEpoch: "Año 312 de la Resonancia (Hace 40 años)",
      timelineEventId: "evt-lore-1",
      involvedEntityIds: ["char-morvath", "fac-orden", "item-prisma", "loc-torre"],
      attributes: {
        Época: "Año 312 de la Resonancia (Hace 40 años)",
        Bandos: "La Orden del Prisma contra el Concilio de Tejedores Libres",
        "Lugar del Suceso": "La Torre del Cénit y los Talleres Centrales",
        Consecuencias:
          "Extinción del gremio original, censura de la historia arcana y creación del monopolio de energía de la Ciudadela flotante.",
        "Estado Actual":
          "Censurado bajo pena de destierro; la versión oficial lo califica de «accidente alquímico».",
      },
      notes:
        "Este hecho histórico es la clave que Orestes descifró antes de desaparecer, y el motivo por el cual Valeria y Alistair se vuelven el blanco de la Inquisición.",
    },
  ],
  relationships: [
    {
      id: "rel-1",
      sourceEntityId: "char-valeria",
      targetEntityId: "char-alistair",
      type: "ally",
      label: "Tregua vigilante & Deuda mutua",
      notes:
        "Valeria desconfía de su pasado como inquisidor, pero respeta su lealtad y destreza marcial. Atracción latente reprimida.",
      sentiment: "complex",
    },
    {
      id: "rel-2",
      sourceEntityId: "char-valeria",
      targetEntityId: "char-damian",
      type: "friend",
      label: "Compañeros de infancia & Amor no correspondido",
      notes:
        "Damián haría cualquier cosa por ella aunque lo enmascare con cinismo mercantil. Valeria lo ve como su único amigo fiel.",
      sentiment: "positive",
    },
    {
      id: "rel-3",
      sourceEntityId: "char-valeria",
      targetEntityId: "char-morvath",
      type: "enemy",
      label: "Enemistad jurada & Rebelión ideológica",
      notes:
        "Morvath ve a Valeria como una anomalía peligrosa que debe ser absorbida o eliminada.",
      sentiment: "negative",
    },
    {
      id: "rel-4",
      sourceEntityId: "char-alistair",
      targetEntityId: "char-morvath",
      type: "enemy",
      label: "Traidor a la Corona / Venganza personal",
      notes:
        "Morvath ordenó ejecutar a su batallón y Alistair busca llevarla ante un tribunal de justos.",
      sentiment: "negative",
    },
    {
      id: "rel-5",
      sourceEntityId: "char-alistair",
      targetEntityId: "char-damian",
      type: "rival",
      label: "Rivalidad profesional y celos sutiles",
      notes:
        "El inquisidor recto choca constantemente con los métodos tramposos del contrabandista.",
      sentiment: "neutral",
    },
    {
      id: "rel-6",
      sourceEntityId: "char-valeria",
      targetEntityId: "item-prisma",
      type: "secret",
      label: "Sintonización involuntaria",
      notes: "Valeria puede escuchar las voces atrapadas en el prisma sin enloquecer.",
      sentiment: "complex",
    },
    {
      id: "rel-7",
      sourceEntityId: "char-morvath",
      targetEntityId: "fac-orden",
      type: "subordinate",
      label: "Comandante Suprema",
      notes: "La Orden acata ciegamente las directivas de la Archiduquesa.",
      sentiment: "positive",
    },
  ],
  timelineTracks: [
    {
      id: "trk-main",
      name: "Trama Principal: El Misterio del Prisma",
      color: "#3b82f6",
      description: "Investigación, persecución y revelación de la conspiración de la ciudadela.",
      isMainPlot: true,
    },
    {
      id: "trk-romance",
      name: "Subtrama: Confianza & Corazones Divididos",
      color: "#ec4899",
      description: "El triángulo de tensiones emocionales entre Valeria, Alistair y Damián.",
      isMainPlot: false,
    },
    {
      id: "trk-inquisition",
      name: "Subtrama: La Cacería de la Orden",
      color: "#8b5cf6",
      description: "El cerco que Morvath y sus inquisidores cierran sobre los fugitivos.",
      isMainPlot: false,
    },
    {
      id: "trk-lore",
      name: "Subtrama: El Origen de los Tejedores",
      color: "#10b981",
      description: "Descubrimiento progresivo de cómo se construyó la ciudadela hace siglos.",
      isMainPlot: false,
    },
  ],
  timelineEvents: [
    {
      id: "evt-lore-1",
      trackId: "trk-lore",
      title: "La Purga de los Tejedores de Luz",
      summary:
        "Las tropas de asalto de Morvath confiscan el Gran Prisma Primordial y destruyen el concilio de tejedores independientes.",
      isHistorical: true,
      era: "Hace 40 años — Primera Era",
      dateOrEpoch: "Año 312 - Noche del Silencio",
      position: 5,
      importance: "climax",
      entityId: "event-purga",
      characterIds: ["char-morvath"],
      locationId: "loc-torre",
      factionIds: ["fac-orden"],
      itemIds: ["item-prisma"],
      consequences:
        "Inicio del régimen teocrático-militar de Morvath y censura total de la memoria arcana libre.",
    },
    {
      id: "evt-1",
      trackId: "trk-main",
      title: "Desaparición de Orestes y encuentro con Alistair",
      summary: "Valeria descubre el taller en ruinas y sella la tregua con el inquisidor prófugo.",
      sceneId: "scene-1",
      position: 10,
      importance: "turning_point",
      characterIds: ["char-valeria", "char-alistair"],
      locationId: "loc-taller",
      dateOrEpoch: "Día 1 - Noche de Tormenta",
    },
    {
      id: "evt-2",
      trackId: "trk-main",
      title: "Negociación en El Cuervo Plateado",
      summary: "Pacto de salvoconducto con Damián a cambio del secreto del taller.",
      sceneId: "scene-2",
      position: 25,
      importance: "key",
      characterIds: ["char-valeria", "char-alistair", "char-damian"],
      locationId: "loc-taberna",
      dateOrEpoch: "Día 2 - Madrugada",
    },
    {
      id: "evt-3",
      trackId: "trk-inquisition",
      title: "Incursión en las Catacumbas Bajas",
      summary: "Primer combate contra los autómatas de resonancia modificados por Morvath.",
      sceneId: "scene-3",
      position: 40,
      importance: "minor",
      characterIds: ["char-valeria", "char-alistair", "char-damian"],
      locationId: "loc-catacumbas",
      dateOrEpoch: "Día 3 - Amanecer Subterráneo",
    },
    {
      id: "evt-4",
      trackId: "trk-main",
      title: "Revelación del Núcleo de Memorias (Midpoint)",
      summary: "Descubrimiento de que la ciudadela flota gracias a las almas robadas. Captura de Alistair.",
      sceneId: "scene-4",
      position: 55,
      importance: "climax",
      characterIds: ["char-valeria", "char-morvath", "char-alistair"],
      locationId: "loc-nucleo",
      dateOrEpoch: "Día 4 - Medio Día",
    },
    {
      id: "evt-5",
      trackId: "trk-main",
      title: "El Gran Alineamiento y Fractura del Cristal",
      summary: "Valeria destruye el prisma en la cúspide de la torre, liberando a las almas.",
      sceneId: "scene-5",
      position: 90,
      importance: "climax",
      characterIds: ["char-valeria", "char-morvath"],
      locationId: "loc-torre",
      dateOrEpoch: "Día 6 - Eclipse Total",
    },
  ],
  storyBeats: [
    {
      id: "beat-1",
      name: "Mundo Ordinario / Planteamiento",
      structure: "three_act",
      percentage: 5,
      description: "Valeria en su taller descifrando reliquias; la vida cotidiana bajo el cielo brumoso.",
      assignedSceneId: "scene-1",
    },
    {
      id: "beat-2",
      name: "Incidente Incitador (Llamada)",
      structure: "three_act",
      percentage: 12,
      description: "La desaparición de Orestes y la llegada de Alistair con el sello roto.",
      assignedSceneId: "scene-1",
    },
    {
      id: "beat-3",
      name: "Primer Punto de Giro (Cruce del Umbral)",
      structure: "three_act",
      percentage: 25,
      description: "Descenso a las Catacumbas Bajas con Damián; ya no hay marcha atrás.",
      assignedSceneId: "scene-3",
    },
    {
      id: "beat-4",
      name: "Punto Medio (Midpoint / Revelación)",
      structure: "three_act",
      percentage: 50,
      description: "La verdad sobre las memorias robadas y la trampa de la Archiduquesa.",
      assignedSceneId: "scene-4",
    },
    {
      id: "beat-5",
      name: "Noche Oscura del Alma",
      structure: "three_act",
      percentage: 75,
      description: "Alistair preso en las mazmorras; Valeria sola dudando de si la verdad vale la caída de la ciudad.",
    },
    {
      id: "beat-6",
      name: "Clímax & Confrontación",
      structure: "three_act",
      percentage: 90,
      description: "Duelo en la torre del alineamiento y fractura voluntaria del prisma.",
      assignedSceneId: "scene-5",
    },
  ],
  relationshipPositions: {
    "char-valeria": { x: 500, y: 350 },
    "char-alistair": { x: 260, y: 220 },
    "char-damian": { x: 740, y: 220 },
    "char-morvath": { x: 500, y: 130 },
    "loc-ciudadela": { x: 220, y: 500 },
    "loc-catacumbas": { x: 760, y: 480 },
    "item-cristal": { x: 500, y: 560 },
    "fac-orden": { x: 220, y: 340 },
    "concept-resonancia": { x: 760, y: 340 },
  },
};

export const demoProject = initialDemoProject;

