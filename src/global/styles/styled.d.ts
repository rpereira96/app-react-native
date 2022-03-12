import 'styled-components'; //importo o styled-components, pois preciso acessar o modo dele
import theme from './theme';

//aqui acesso o modo do styled components para sobrescrever o tema
declare module 'styled-components' {
    
    //copio o tipo do objeto theme para a variável ThemeType, que agora armazena o tipo da theme
    type ThemeType = typeof theme

    //pego a interface Default de theme e acrescento o tipo do theme que eu criei
    export interface DefaultTheme extends ThemeType {}
}