import { Injectable } from '@nestjs/common';

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
}

@Injectable()
export class ExportService {
  toCss(colors: Colors) {
    const css = `:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
}

.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-accent { background-color: var(--color-accent); }
.bg-surface { background-color: var(--color-surface); }
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.text-accent { color: var(--color-accent); }
.text-surface { color: var(--color-surface); }
.text-on-primary { color: var(--color-text); }`;

    return { css };
  }

  toTailwind(colors: Colors) {
    const tailwind = `@theme {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
}`;

    return { tailwind };
  }
}
