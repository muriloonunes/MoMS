import React from "react";
import Svg, {Circle, Polygon, Rect} from "react-native-svg";

/**
 * Ícone vetorial minimalista da bandeira do Brasil com paleta adaptada ao tema escuro/editorial do museu.
 * Exibido ao lado do título ou do ano nos passos marcados com `isBrazil: true`.
 *
 * @param size Largura do ícone em pixels (a altura é calculada proporcionalmente na razão 0.7).
 */
export function BrazilFlagIcon({size = 22}: { size?: number }) {
    const height = Math.round(size * 0.7);
    return (
        <Svg width={size} height={height} viewBox="0 0 22 15">
            <Rect x="0.5" y="0.5" width="21" height="14" rx="2.5" fill="#1F5C3A" stroke="#C89B3C" strokeWidth="1"/>
            <Polygon points="11,2.3 18.8,7.5 11,12.7 3.2,7.5" fill="#D8A944"/>
            <Circle cx="11" cy="7.5" r="2.7" fill="#1C355E"/>
        </Svg>
    );
}
