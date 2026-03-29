export const COLORS = {
  white: '#ffffff',
  green: '#00cc44', // Bright clear green
  red: '#ff1a1a', // Pure bright red
  blue: '#0066ff', // Bright blue
  orange: '#ff7700', // Deeper orange, further from yellow but avoid too much red
  yellow: '#ffff00', // Piercing pure yellow
};

export const EDGES = [
  { id: 'UB', face1: 'white', face2: 'blue', name: 'Up-Back' },
  { id: 'UR', face1: 'white', face2: 'red', name: 'Up-Right', isBufferCandidate: true },
  { id: 'UF', face1: 'white', face2: 'green', name: 'Up-Front' },
  { id: 'UL', face1: 'white', face2: 'orange', name: 'Up-Left' },

  { id: 'LU', face1: 'orange', face2: 'white', name: 'Left-Up' },
  { id: 'LF', face1: 'orange', face2: 'green', name: 'Left-Front' },
  { id: 'LD', face1: 'orange', face2: 'yellow', name: 'Left-Down' },
  { id: 'LB', face1: 'orange', face2: 'blue', name: 'Left-Back' },

  { id: 'FU', face1: 'green', face2: 'white', name: 'Front-Up' },
  { id: 'FR', face1: 'green', face2: 'red', name: 'Front-Right' },
  { id: 'FD', face1: 'green', face2: 'yellow', name: 'Front-Down' },
  { id: 'FL', face1: 'green', face2: 'orange', name: 'Front-Left' },

  { id: 'RU', face1: 'red', face2: 'white', name: 'Right-Up', isBufferCandidate: true },
  { id: 'RB', face1: 'red', face2: 'blue', name: 'Right-Back' },
  { id: 'RD', face1: 'red', face2: 'yellow', name: 'Right-Down' },
  { id: 'RF', face1: 'red', face2: 'green', name: 'Right-Front' },

  { id: 'BU', face1: 'blue', face2: 'white', name: 'Back-Up' },
  { id: 'BL', face1: 'blue', face2: 'orange', name: 'Back-Left' },
  { id: 'BD', face1: 'blue', face2: 'yellow', name: 'Back-Down' },
  { id: 'BR', face1: 'blue', face2: 'red', name: 'Back-Right' },

  { id: 'DF', face1: 'yellow', face2: 'green', name: 'Down-Front' },
  { id: 'DR', face1: 'yellow', face2: 'red', name: 'Down-Right' },
  { id: 'DB', face1: 'yellow', face2: 'blue', name: 'Down-Back' },
  { id: 'DL', face1: 'yellow', face2: 'orange', name: 'Down-Left' }
];

// Standard mappings
export const DEFAULT_MAPPINGS = {
  RU: {
    UB: 'А', UR: 'Б', UF: 'В', UL: 'Г',
    LU: 'Д', LF: 'Е', LD: 'Ж', LB: 'З',
    FU: 'И', FR: 'К', FD: 'Л', FL: 'М', // skipping Й
    RU: 'Н', RB: 'О', RD: 'П', RF: 'Р',
    BU: 'С', BL: 'Т', BD: 'У', BR: 'Ф',
    DF: 'Х', DR: 'Ц', DB: 'Ч', DL: 'Ш'
  },
  EN: {
    UB: 'A', UR: 'B', UF: 'C', UL: 'D',
    LU: 'E', LF: 'F', LD: 'G', LB: 'H',
    FU: 'I', FR: 'J', FD: 'K', FL: 'L',
    RU: 'M', RB: 'N', RD: 'O', RF: 'P',
    BU: 'Q', BL: 'R', BD: 'S', BR: 'T',
    DF: 'U', DR: 'V', DB: 'W', DL: 'X'
  }
};
