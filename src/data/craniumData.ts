export type BoneCategory = 'Neurocráneo' | 'Viscerocráneo' | 'Base y cavidades';

export interface Bone {
  id: string;
  name: string;
  latin: string;
  category: BoneCategory;
  color: string;
  glow: string;
  // posición del hotspot sobre la imagen explotada (porcentaje)
  x: number;
  y: number;
  side: 'left' | 'right' | 'center';
  short: string;
  description: string;
  funcion: string;
  funFact: string;
  checkpointId: number;
  // posición 3D aproximada para el holograma
  pos3d: [number, number, number];
}

export interface Checkpoint {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  color: string;
  gradient: string;
  icon: string;
  bones: string[];
  requiredStars: number;
  duration: string;
}

export interface Question {
  id: string;
  checkpointId: number;
  type: 'multiple' | 'truefalse' | 'identify';
  question: string;
  options?: string[];
  correctIndex?: number;
  correctBoolean?: boolean;
  targetBoneId?: string;
  explanation: string;
  points: number;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  hint: string;
}

export const BONES: Bone[] = [
  {
    id: 'frontal',
    name: 'Hueso Frontal',
    latin: 'Os frontale',
    category: 'Neurocráneo',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.5)',
    x: 27, y: 28, side: 'left',
    short: 'La frente y techo de las órbitas',
    description: 'Forma la frente y el techo de las órbitas oculares. Es un hueso impar que en los bebés está dividido en dos mitades unidas por la sutura metópica. Protege el lóbulo frontal del cerebro, donde tomamos decisiones.',
    funcion: 'Protege el lóbulo frontal y da forma a la frente.',
    funFact: '¡Tus senos frontales hacen que tu voz suene diferente cuando estás resfriado!',
    checkpointId: 1,
    pos3d: [0, 1.1, 1.15],
  },
  {
    id: 'parietal',
    name: 'Hueso Parietal',
    latin: 'Os parietale',
    category: 'Neurocráneo',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
    x: 22, y: 46, side: 'left',
    short: 'Las paredes laterales del cráneo',
    description: 'Son dos huesos planos que forman los lados y el techo de la bóveda craneal. Se unen en el centro con la sutura sagital, como el cierre de un casco. Protegen los lóbulos parietales del cerebro.',
    funcion: 'Forman la bóveda craneal y protegen el cerebro.',
    funFact: 'Si te tocas la coronilla, ¡estás tocando donde se unen tus dos parietales!',
    checkpointId: 1,
    pos3d: [-1.25, 0.9, 0.1],
  },
  {
    id: 'occipital',
    name: 'Hueso Occipital',
    latin: 'Os occipitale',
    category: 'Neurocráneo',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.5)',
    x: 18, y: 56, side: 'left',
    short: 'La parte trasera con el gran agujero',
    description: 'Está en la parte posterior e inferior del cráneo. Contiene el foramen magnum, el gran orificio por donde la médula espinal se conecta con el cerebro. Protege la zona de la visión.',
    funcion: 'Protege el lóbulo occipital (visión) y deja pasar la médula.',
    funFact: 'Tiene una pequeña protuberancia que puedes palpar detrás de tu cabeza: la protuberancia occipital.',
    checkpointId: 1,
    pos3d: [0, 0.35, -1.45],
  },
  {
    id: 'neurocraneo',
    name: 'Neurocráneo',
    latin: 'Neurocranium',
    category: 'Neurocráneo',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.5)',
    x: 24, y: 19, side: 'left',
    short: 'El casco de 8 huesos que guarda el cerebro',
    description: 'No es un solo hueso, sino el conjunto de 8 huesos que forman la caja protectora del cerebro: frontal, 2 parietales, 2 temporales, occipital, esfenoides y etmoides. Es como el casco de astronauta de tu cerebro.',
    funcion: 'Proteger el encéfalo y los órganos de los sentidos.',
    funFact: 'El neurocráneo de un adulto pesa solo ~500g pero protege un cerebro de 1.4kg.',
    checkpointId: 1,
    pos3d: [0, 1.6, 0],
  },
  {
    id: 'temporal',
    name: 'Hueso Temporal',
    latin: 'Os temporale',
    category: 'Neurocráneo',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.5)',
    x: 19, y: 64, side: 'left',
    short: 'La casa del oído',
    description: 'Hay dos, uno a cada lado, cerca de las orejas. Contienen el oído interno y medio: ¡toda la maquinaria para escuchar y mantener el equilibrio! Su apófisis mastoides es el bulto duro detrás de la oreja.',
    funcion: 'Aloja el oído y el equilibrio, y articula la mandíbula.',
    funFact: 'El hueso temporal contiene los huesos más pequeños del cuerpo: martillo, yunque y estribo.',
    checkpointId: 2,
    pos3d: [1.45, 0.1, -0.1],
  },
  {
    id: 'esfenoides',
    name: 'Hueso Esfenoides',
    latin: 'Os sphenoidale',
    category: 'Neurocráneo',
    color: '#fb7185',
    glow: 'rgba(251,113,133,0.5)',
    x: 78, y: 15, side: 'right',
    short: 'La mariposa central que une todo',
    description: 'Tiene forma de mariposa o murciélago y está en el centro de la base del cráneo. ¡Todos los demás huesos del cráneo se articulan con él! Contiene la silla turca, donde vive la glándula hipófisis.',
    funcion: 'Es la pieza clave que une todos los huesos craneales.',
    funFact: 'Los anatomistas lo llaman "la piedra angular" del cráneo, como la pieza central de un arco.',
    checkpointId: 2,
    pos3d: [0, -0.1, 0.2],
  },
  {
    id: 'etmoides',
    name: 'Hueso Etmoides',
    latin: 'Os ethmoidale',
    category: 'Neurocráneo',
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    x: 79, y: 25, side: 'right',
    short: 'El colador del olfato',
    description: 'Un hueso ligero y esponjoso entre los ojos. Su lámina cribosa está llena de agujeritos por donde pasan los nervios del olfato desde la nariz al cerebro. Forma parte de las órbitas y la cavidad nasal.',
    funcion: 'Deja pasar el nervio olfativo y forma la nariz interna.',
    funFact: 'Tiene forma de cubo de azúcar poroso: por eso es tan liviano.',
    checkpointId: 2,
    pos3d: [0, 0.25, 0.9],
  },
  {
    id: 'facial',
    name: 'Cráneo Facial',
    latin: 'Viscerocranium',
    category: 'Viscerocráneo',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.5)',
    x: 24, y: 10, side: 'left',
    short: 'Los 14 huesos de tu cara',
    description: 'Es el conjunto de 14 huesos que forman la cara: maxilares, cigomáticos, nasales, lagrimales, vómer, palatinos, conchas y mandíbula. Sostienen los ojos, la nariz y la boca, y te dan tu apariencia única.',
    funcion: 'Sostener la cara, proteger sentidos y permitir masticar.',
    funFact: 'De los 14 huesos faciales, ¡solo la mandíbula se puede mover!',
    checkpointId: 3,
    pos3d: [0, -0.5, 1.25],
  },
  {
    id: 'maxilar',
    name: 'Maxilar Superior',
    latin: 'Maxilla',
    category: 'Viscerocráneo',
    color: '#e879f9',
    glow: 'rgba(232,121,249,0.5)',
    x: 80, y: 33, side: 'right',
    short: 'El que sostiene tus dientes de arriba',
    description: 'Son dos huesos fusionados que forman el maxilar superior, el suelo de las órbitas y gran parte del paladar. Sostienen los 16 dientes superiores. Es fijo: no se mueve al masticar.',
    funcion: 'Sostiene los dientes superiores y forma el paladar.',
    funFact: 'Es el segundo hueso más grande de la cara después de la mandíbula.',
    checkpointId: 3,
    pos3d: [-0.45, -0.65, 1.05],
  },
  {
    id: 'vomer',
    name: 'Vómer',
    latin: 'Vomer',
    category: 'Viscerocráneo',
    color: '#93c5fd',
    glow: 'rgba(147,197,253,0.5)',
    x: 18, y: 82, side: 'left',
    short: 'El tabique de la nariz',
    description: 'Es una delgada lámina con forma de arado que divide la cavidad nasal en dos mitades: izquierda y derecha. Su nombre significa "reja de arado" en latín. Cuando se desvía, cuesta respirar.',
    funcion: 'Divide la nariz en dos fosas nasales.',
    funFact: 'El 80% de las personas tiene el vómer un poco desviado sin saberlo.',
    checkpointId: 3,
    pos3d: [0, -0.35, 0.85],
  },
  {
    id: 'conchas',
    name: 'Conchas Nasales',
    latin: 'Conchae nasales',
    category: 'Viscerocráneo',
    color: '#5eead4',
    glow: 'rgba(94,234,212,0.5)',
    x: 82, y: 55, side: 'right',
    short: 'Los radiadores de la nariz',
    description: 'Son láminas óseas en forma de concha marina dentro de la nariz (3 de cada lado). Calientan, humedecen y filtran el aire que respiras, como un aire acondicionado natural.',
    funcion: 'Acondicionan el aire antes de que llegue a los pulmones.',
    funFact: 'Tus conchas filtran unos 10.000 litros de aire cada día.',
    checkpointId: 3,
    pos3d: [0.35, -0.3, 0.8],
  },
  {
    id: 'paladar',
    name: 'Paladar Huesudo',
    latin: 'Palatum osseum',
    category: 'Viscerocráneo',
    color: '#fde68a',
    glow: 'rgba(253,230,138,0.5)',
    x: 82, y: 66, side: 'right',
    short: 'El techo de tu boca',
    description: 'Es el techo duro de la boca, formado por el maxilar y los huesos palatinos. Separa la boca de la nariz para que puedas comer y respirar al mismo tiempo sin atragantarte. Tócalo con la lengua: ¡es duro!',
    funcion: 'Separa la boca de la cavidad nasal para comer y hablar.',
    funFact: 'Sin paladar no podrías pronunciar la letra "T" ni la "D".',
    checkpointId: 3,
    pos3d: [0, -0.75, 0.6],
  },
  {
    id: 'mandibula',
    name: 'Mandíbula',
    latin: 'Mandibula',
    category: 'Viscerocráneo',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.5)',
    x: 84, y: 44, side: 'right',
    short: 'El único hueso móvil de la cabeza',
    description: 'El hueso más grande y fuerte de la cara. Tiene forma de herradura y sostiene los 16 dientes inferiores. Es el ÚNICO hueso del cráneo que se mueve, gracias a la articulación temporomandibular.',
    funcion: 'Masticar, hablar y dar forma al mentón.',
    funFact: '¡Tu mandíbula puede ejercer una fuerza de hasta 70 kg al morder!',
    checkpointId: 4,
    pos3d: [0, -1.25, 0.75],
  },
  {
    id: 'foramen',
    name: 'Foramen Magnum',
    latin: 'Foramen magnum',
    category: 'Base y cavidades',
    color: '#fca5a5',
    glow: 'rgba(252,165,165,0.5)',
    x: 83, y: 75, side: 'right',
    short: 'El gran agujero de la vida',
    description: 'Es el orificio más grande del cráneo, en la base del hueso occipital. Por aquí pasa la médula espinal que conecta el cerebro con todo el cuerpo, además de arterias y nervios vitales.',
    funcion: 'Conecta el cerebro con la médula espinal.',
    funFact: 'Su posición revela si una especie caminaba erguida: ¡clave para estudiar fósiles humanos!',
    checkpointId: 5,
    pos3d: [0, -0.6, -0.9],
  },
  {
    id: 'fosas',
    name: 'Fosas Craneales',
    latin: 'Fossae cranii',
    category: 'Base y cavidades',
    color: '#6ee7b7',
    glow: 'rgba(110,231,183,0.5)',
    x: 83, y: 84, side: 'right',
    short: 'Los 3 pisos donde descansa el cerebro',
    description: 'Son tres depresiones escalonadas en la base interna del cráneo (anterior, media y posterior) donde descansan los diferentes lóbulos del cerebro, como pisos de un edificio de 3 niveles.',
    funcion: 'Alojar y sostener cada parte del encéfalo.',
    funFact: 'La fosa posterior alberga el cerebelo: tu centro del equilibrio.',
    checkpointId: 5,
    pos3d: [0, -0.35, -0.3],
  },
  {
    id: 'canales',
    name: 'Canales Craneales',
    latin: 'Canales cranii',
    category: 'Base y cavidades',
    color: '#7dd3fc',
    glow: 'rgba(125,211,252,0.5)',
    x: 83, y: 90, side: 'right',
    short: 'Los túneles de nervios y vasos',
    description: 'Son los conductos, forámenes y fisuras de la base del cráneo por donde entran y salen los 12 pares de nervios craneales y los vasos sanguíneos. Como túneles de una autopista de información.',
    funcion: 'Permitir el paso de nervios y vasos sanguíneos.',
    funFact: 'Por estos túneles viajan las señales que te permiten ver, oír, oler y mover la cara.',
    checkpointId: 5,
    pos3d: [0.7, -0.4, -0.5],
  },
];

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 1,
    code: 'CP-01',
    title: 'Bóveda Protectora',
    subtitle: 'El casco del cerebro',
    description: 'Inicia tu misión en la parte superior del cráneo. Aprende cómo 4 estructuras forman el casco que protege tu cerebro de 1.4 kg.',
    mission: 'Explora 4 estructuras y supera el quiz con al menos 2 estrellas para desbloquear el siguiente sector.',
    color: '#22d3ee',
    gradient: 'from-cyan-500 to-blue-600',
    icon: 'shield',
    bones: ['neurocraneo', 'frontal', 'parietal', 'occipital'],
    requiredStars: 2,
    duration: '8 min',
  },
  {
    id: 2,
    code: 'CP-02',
    title: 'Núcleo Central',
    subtitle: 'Los huesos ocultos',
    description: 'Desciende al interior del cráneo. Descubre los huesos más extraños: la mariposa, el colador del olfato y la casa del oído.',
    mission: 'Encuentra los 3 huesos internos y responde correctamente para activar el escáner auditivo.',
    color: '#fbbf24',
    gradient: 'from-amber-400 to-orange-600',
    icon: 'ear',
    bones: ['temporal', 'esfenoides', 'etmoides'],
    requiredStars: 2,
    duration: '10 min',
  },
  {
    id: 3,
    code: 'CP-03',
    title: 'El Rostro',
    subtitle: 'Arquitectura facial',
    description: 'Viaja a la cara: 5 estructuras que te permiten respirar, oler, saborear y sonreír. La zona más visible del cráneo.',
    mission: 'Mapea las 5 estructuras faciales y completa el desafío de identificación táctil.',
    color: '#f97316',
    gradient: 'from-orange-500 to-rose-600',
    icon: 'smile',
    bones: ['facial', 'maxilar', 'vomer', 'conchas', 'paladar'],
    requiredStars: 2,
    duration: '12 min',
  },
  {
    id: 4,
    code: 'CP-04',
    title: 'Mandíbula Dinámica',
    subtitle: 'El hueso que se mueve',
    description: 'La única parte móvil del cráneo. Aprende biomecánica: cómo muerdes con 70 kg de fuerza y por qué puedes hablar.',
    mission: 'Domina la articulación temporomandibular en el simulador de masticación.',
    color: '#c084fc',
    gradient: 'from-violet-500 to-purple-700',
    icon: 'zap',
    bones: ['mandibula'],
    requiredStars: 2,
    duration: '6 min',
  },
  {
    id: 5,
    code: 'CP-05',
    title: 'Base Profunda',
    subtitle: 'Los túneles de la vida',
    description: 'Misión final en la base del cráneo: el gran agujero y los túneles por donde el cerebro se comunica con todo tu cuerpo.',
    mission: 'Supera el examen final y obtén tu certificado de Explorador Craneal.',
    color: '#34d399',
    gradient: 'from-emerald-400 to-teal-600',
    icon: 'trophy',
    bones: ['foramen', 'fosas', 'canales'],
    requiredStars: 2,
    duration: '10 min',
  },
];

export const QUESTIONS: Question[] = [
  // CP1
  {
    id: 'q1-1', checkpointId: 1, type: 'multiple',
    question: '¿Qué hueso forma la frente y protege el lóbulo frontal?',
    options: ['Hueso parietal', 'Hueso frontal', 'Hueso occipital', 'Hueso temporal'],
    correctIndex: 1,
    explanation: 'El hueso frontal forma la frente y el techo de las órbitas. Protege el lóbulo frontal, donde tomamos decisiones.',
    points: 100, difficulty: 'Fácil',
    hint: 'Piensa en la palabra "frente"...',
  },
  {
    id: 'q1-2', checkpointId: 1, type: 'truefalse',
    question: 'El neurocráneo está formado por 8 huesos que protegen el cerebro.',
    correctBoolean: true,
    explanation: '¡Correcto! Son: frontal (1), parietales (2), temporales (2), occipital (1), esfenoides (1) y etmoides (1) = 8 huesos.',
    points: 100, difficulty: 'Fácil',
    hint: 'Cuenta: 1 frontal + 2 parietales + 2 temporales + 1 occipital + 1 esfenoides + 1 etmoides.',
  },
  {
    id: 'q1-3', checkpointId: 1, type: 'identify',
    question: 'CHECKPOINT TÁCTIL: Toca el hueso PARIETAL en el visor 3D para continuar.',
    targetBoneId: 'parietal',
    explanation: 'Los parietales son los dos huesos planos de los lados y el techo del cráneo. ¡Bien localizado!',
    points: 150, difficulty: 'Medio',
    hint: 'Busca los paneles laterales de color violeta en el holograma.',
  },
  {
    id: 'q1-4', checkpointId: 1, type: 'multiple',
    question: '¿Qué hueso protege la zona de la visión en la parte posterior?',
    options: ['Frontal', 'Esfenoides', 'Occipital', 'Vómer'],
    correctIndex: 2,
    explanation: 'El occipital está atrás y protege el lóbulo occipital, responsable de procesar lo que ves.',
    points: 120, difficulty: 'Medio',
    hint: 'Está en la parte de atrás de tu cabeza.',
  },
  // CP2
  {
    id: 'q2-1', checkpointId: 2, type: 'multiple',
    question: '¿Qué hueso tiene forma de mariposa y une a todos los demás?',
    options: ['Etmoides', 'Temporal', 'Parietal', 'Esfenoides'],
    correctIndex: 3,
    explanation: 'El esfenoides es la "piedra angular" del cráneo: todos los demás huesos se articulan con él.',
    points: 120, difficulty: 'Medio',
    hint: 'Su nombre empieza con "Esf..." y está en el centro.',
  },
  {
    id: 'q2-2', checkpointId: 2, type: 'multiple',
    question: '¿Qué hueso contiene el oído interno y los huesecillos más pequeños del cuerpo?',
    options: ['Hueso temporal', 'Hueso frontal', 'Maxilar superior', 'Vómer'],
    correctIndex: 0,
    explanation: 'El temporal aloja el oído medio e interno, con el martillo, yunque y estribo.',
    points: 100, difficulty: 'Fácil',
    hint: 'Está justo al lado de tus orejas.',
  },
  {
    id: 'q2-3', checkpointId: 2, type: 'truefalse',
    question: 'El hueso etmoides tiene agujeritos por donde pasa el nervio del olfato.',
    correctBoolean: true,
    explanation: '¡Verdadero! Su lámina cribosa es como un colador que deja pasar las fibras olfativas de la nariz al cerebro.',
    points: 100, difficulty: 'Fácil',
    hint: 'Piensa en su apodo: "el colador del olfato".',
  },
  {
    id: 'q2-4', checkpointId: 2, type: 'identify',
    question: 'CHECKPOINT TÁCTIL: Localiza el hueso TEMPORAL en el visor. ¡Es la casa del oído!',
    targetBoneId: 'temporal',
    explanation: '¡Excelente! Los temporales están a los lados, junto a las orejas.',
    points: 150, difficulty: 'Medio',
    hint: 'Busca el hueso ámbar/dorado a los lados del holograma.',
  },
  // CP3
  {
    id: 'q3-1', checkpointId: 3, type: 'multiple',
    question: '¿Cuántos huesos forman el cráneo facial (viscerocráneo)?',
    options: ['8 huesos', '14 huesos', '22 huesos', '6 huesos'],
    correctIndex: 1,
    explanation: 'El viscerocráneo tiene 14 huesos: 2 maxilares, 2 cigomáticos, 2 nasales, 2 lagrimales, vómer, 2 palatinos, 2 conchas y mandíbula.',
    points: 120, difficulty: 'Medio',
    hint: 'Son más que los del neurocráneo (8).',
  },
  {
    id: 'q3-2', checkpointId: 3, type: 'multiple',
    question: '¿Qué hueso divide la nariz en dos fosas nasales?',
    options: ['Conchas nasales', 'Paladar', 'Vómer', 'Etmoides'],
    correctIndex: 2,
    explanation: 'El vómer es la delgada lámina con forma de arado que separa las fosas nasales izquierda y derecha.',
    points: 100, difficulty: 'Fácil',
    hint: 'Su nombre significa "reja de arado" en latín.',
  },
  {
    id: 'q3-3', checkpointId: 3, type: 'truefalse',
    question: 'Las conchas nasales calientan y filtran el aire que respiramos.',
    correctBoolean: true,
    explanation: '¡Verdadero! Funcionan como un aire acondicionado: calientan, humedecen y filtran unos 10.000 litros de aire al día.',
    points: 100, difficulty: 'Fácil',
    hint: 'Piensa en su función de "radiadores".',
  },
  {
    id: 'q3-4', checkpointId: 3, type: 'identify',
    question: 'CHECKPOINT TÁCTIL: Toca el MAXILAR SUPERIOR en el visor 3D.',
    targetBoneId: 'maxilar',
    explanation: '¡Perfecto! El maxilar sostiene tus 16 dientes superiores y forma gran parte del paladar.',
    points: 150, difficulty: 'Difícil',
    hint: 'Busca el hueso rosado en la zona de los dientes superiores.',
  },
  {
    id: 'q3-5', checkpointId: 3, type: 'multiple',
    question: '¿Qué estructura separa la boca de la nariz para poder comer y respirar?',
    options: ['El vómer', 'El paladar huesudo', 'El foramen magnum', 'Las fosas craneales'],
    correctIndex: 1,
    explanation: 'El paladar huesudo es el techo duro de la boca que separa ambas cavidades.',
    points: 120, difficulty: 'Medio',
    hint: 'Tócalo con tu lengua: es el techo duro de tu boca.',
  },
  // CP4
  {
    id: 'q4-1', checkpointId: 4, type: 'truefalse',
    question: 'La mandíbula es el único hueso móvil de todo el cráneo.',
    correctBoolean: true,
    explanation: '¡Verdadero! Se mueve gracias a la articulación temporomandibular (ATM) que la une a los huesos temporales.',
    points: 100, difficulty: 'Fácil',
    hint: 'Intenta mover otros huesos de tu cabeza... solo uno se mueve.',
  },
  {
    id: 'q4-2', checkpointId: 4, type: 'multiple',
    question: '¿Cuánta fuerza puede ejercer la mandíbula al morder?',
    options: ['5 kg', '20 kg', 'Hasta 70 kg', '200 kg'],
    correctIndex: 2,
    explanation: 'Los músculos maseteros permiten morder con hasta 70 kg de fuerza en los molares. ¡Más fuerte que un pitbull proporcionalmente!',
    points: 130, difficulty: 'Medio',
    hint: 'Es mucho más de lo que imaginas...',
  },
  {
    id: 'q4-3', checkpointId: 4, type: 'identify',
    question: 'CHECKPOINT TÁCTIL: Selecciona la MANDÍBULA en el visor para activar el simulador.',
    targetBoneId: 'mandibula',
    explanation: '¡La encontraste! Esa herradura morada es el hueso más fuerte de tu cara.',
    points: 150, difficulty: 'Fácil',
    hint: 'Es la pieza inferior con forma de U, de color violeta.',
  },
  // CP5
  {
    id: 'q5-1', checkpointId: 5, type: 'multiple',
    question: '¿Qué pasa a través del foramen magnum?',
    options: ['El nervio óptico', 'La médula espinal', 'El aire de la nariz', 'La saliva'],
    correctIndex: 1,
    explanation: 'Por este gran orificio pasa la médula espinal que conecta el cerebro con todo el cuerpo.',
    points: 100, difficulty: 'Fácil',
    hint: 'Conecta el cerebro con el resto del cuerpo.',
  },
  {
    id: 'q5-2', checkpointId: 5, type: 'multiple',
    question: '¿Cuántas fosas craneales hay en la base interna del cráneo?',
    options: ['2 fosas', '3 fosas', '5 fosas', '8 fosas'],
    correctIndex: 1,
    explanation: 'Hay 3 fosas escalonadas: anterior, media y posterior, como pisos donde descansan los lóbulos cerebrales.',
    points: 120, difficulty: 'Medio',
    hint: 'Piensa en un edificio de 3 pisos.',
  },
  {
    id: 'q5-3', checkpointId: 5, type: 'truefalse',
    question: 'Por los canales craneales pasan los 12 pares de nervios craneales.',
    correctBoolean: true,
    explanation: '¡Verdadero! Estos túneles permiten que las señales viajen para ver, oír, oler y mover la cara.',
    points: 130, difficulty: 'Medio',
    hint: 'Son las autopistas de información del cráneo.',
  },
  {
    id: 'q5-4', checkpointId: 5, type: 'multiple',
    question: 'EXAMEN FINAL: ¿Cuántos huesos tiene el cráneo completo de un adulto?',
    options: ['14 huesos', '8 huesos', '22 huesos', '33 huesos'],
    correctIndex: 2,
    explanation: '¡Felicidades, explorador! 8 del neurocráneo + 14 del viscerocráneo = 22 huesos craneales.',
    points: 200, difficulty: 'Difícil',
    hint: 'Suma: 8 + 14 = ?',
  },
];

export const RANKS = [
  { minXP: 0, name: 'Novato Anatómico', icon: '🌱' },
  { minXP: 300, name: 'Explorador Óseo', icon: '🔍' },
  { minXP: 700, name: 'Guardián Craneal', icon: '🛡️' },
  { minXP: 1200, name: 'Neurocirujano Jr.', icon: '🧠' },
  { minXP: 1800, name: 'Maestro del Cráneo', icon: '👑' },
];

export function getRank(xp: number) {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXP) current = r;
  return current;
}
