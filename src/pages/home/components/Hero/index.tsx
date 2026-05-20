import { HERO_VARIANT } from '../../config';
import HeroScatterPile from './HeroScatterPile';
import HeroSplitWipe from './HeroSplitWipe';
import HeroMarqueeReveal from './HeroMarqueeReveal';

const Hero = () => {
  switch (HERO_VARIANT) {
    case 'split':
      return <HeroSplitWipe />;
    case 'marquee':
      return <HeroMarqueeReveal />;
    case 'scatter':
    default:
      return <HeroScatterPile />;
  }
};

export default Hero;
