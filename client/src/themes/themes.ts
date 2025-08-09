import theme_8008 from '/src/themes/8008';
import theme_carbon from '/src/themes/carbon';
import theme_dmg from '/src/themes/dmg';
import theme_dracula from '/src/themes/dracula';
import theme_modernink from '/src/themes/modernink';
import theme_neon from '/src/themes/neon';
import theme_nus from '/src/themes/nus';
import theme_ocean from '/src/themes/ocean';
import theme_peaches from '/src/themes/peaches';
import theme_terminal from '/src/themes/terminal';
import { ThemeProps } from '/src/themes/theme.interface';

export const themeItems: ThemeProps[] = [
  theme_8008,
  theme_terminal,
  theme_modernink,
  theme_dmg,
  theme_nus,
  theme_carbon,
  theme_ocean,
  theme_neon,
  theme_dracula,
  theme_peaches,
];
export const darkThemes: ThemeProps[] = [
  theme_8008,
  theme_terminal,
  theme_carbon,
  theme_neon,
  theme_dracula,
];
export const lightThemes: ThemeProps[] = [
  theme_modernink,
  theme_dmg,
  theme_nus,
  theme_ocean,
  theme_peaches,
];
