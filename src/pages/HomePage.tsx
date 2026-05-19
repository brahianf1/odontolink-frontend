import { Box } from '@mui/material';
import Hero from './home/components/Hero';
import BenefitsByRole from './home/components/BenefitsByRole';
import HowItWorks from './home/components/HowItWorks';
import Testimonials from './home/components/Testimonials';
import LocationMap from './home/components/LocationMap';
import Faq from './home/components/Faq';

const HomePage = () => {
  return (
    <Box component="main" sx={{ width: '100%', backgroundColor: 'background.default' }}>
      <Hero />
      <BenefitsByRole />
      <HowItWorks />
      <Testimonials />
      <LocationMap />
      <Faq />
    </Box>
  );
};

export default HomePage;
