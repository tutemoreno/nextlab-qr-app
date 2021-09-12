import { deepPurple } from '@material-ui/core/colors';
import { esES as coreEsES } from '@material-ui/core/locale';
import { createTheme } from '@material-ui/core/styles';

export const theme = createTheme(
  {
    palette: {
      deepPurple,
    },
  },
  coreEsES,
);
