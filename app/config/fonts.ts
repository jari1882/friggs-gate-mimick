export const fontOptions = [
  { value: 'inter', label: 'Inter (Default)', family: 'Inter, sans-serif' },
  { value: 'roboto', label: 'Roboto', family: 'Roboto, sans-serif' },
  { value: 'open-sans', label: 'Open Sans', family: 'Open Sans, sans-serif' },
  { value: 'lato', label: 'Lato', family: 'Lato, sans-serif' },
  { value: 'poppins', label: 'Poppins', family: 'Poppins, sans-serif' },
  { value: 'montserrat', label: 'Montserrat', family: 'Montserrat, sans-serif' },
  { value: 'source-sans', label: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif' },
  { value: 'ubuntu', label: 'Ubuntu', family: 'Ubuntu, sans-serif' },
  { value: 'nunito', label: 'Nunito', family: 'Nunito, sans-serif' },
  { value: 'system', label: 'System Default', family: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
  { value: 'fira-code', label: 'Fira Code (Mono)', family: 'Fira Code, Consolas, Monaco, monospace' },
  { value: 'jetbrains-mono', label: 'JetBrains Mono', family: 'JetBrains Mono, Consolas, Monaco, monospace' }
];

export const fontFamilies = {
  inter: 'Inter, sans-serif',
  roboto: 'Roboto, sans-serif',
  openSans: 'Open Sans, sans-serif',
  lato: 'Lato, sans-serif',
  poppins: 'Poppins, sans-serif',
  montserrat: 'Montserrat, sans-serif',
  sourceSans: 'Source Sans Pro, sans-serif',
  ubuntu: 'Ubuntu, sans-serif',
  nunito: 'Nunito, sans-serif',
  system: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  firaCode: 'Fira Code, Consolas, Monaco, monospace',
  jetbrainsMono: 'JetBrains Mono, Consolas, Monaco, monospace',
  default: 'Roboto, -apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Helvetica Neue\', Arial, sans-serif'
};

// Helper function to get font family by value
export const getFontFamily = (fontValue: string): string => {
  const font = fontOptions.find(f => f.value === fontValue);
  return font?.family || fontFamilies.default;
};