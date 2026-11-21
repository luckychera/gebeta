import type { ImageSourcePropType } from 'react-native';

export const foodImages: Record<string, ImageSourcePropType> = {
  injera: require('../../assets/foods/injera.jpg'),
  shiro: require('../../assets/foods/shiro.jpg'),
  doro: require('../../assets/foods/doro.jpg'),
  kitfo: require('../../assets/foods/kitfo.jpg'),
  kocho: require('../../assets/foods/kocho.jpg'),
  gomen: require('../../assets/foods/gomen.jpg'),
  bulla: require('../../assets/foods/bulla.jpg'),
  genfo: require('../../assets/foods/genfo.jpg'),
  hero: require('../../assets/foods/hero.jpg'),
};

export function imageFor(key: string): ImageSourcePropType {
  return foodImages[key] ?? foodImages.hero;
}
