import theme_8008 from './8008';
import theme_carbon from './carbon';
import theme_dmg from './dmg';
import theme_dracula from './dracula';
import theme_modernink from './modernink';
import theme_neon from './neon';
import theme_nus from './nus';
import theme_ocean from './ocean';
import theme_peaches from './peaches';
import theme_terminal from './terminal';
import { ThemeProps } from './theme.inteface';

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
