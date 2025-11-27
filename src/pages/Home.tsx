import React from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../features/landing/Hero';
import { TrustedBy } from '../features/landing/TrustedBy';
import { ComparisonSection } from '../features/landing/ComparisonSection';
import { FeaturesGrid } from '../features/landing/FeaturesGrid';
import { StartTrial } from '../features/landing/StartTrial';

export const Home: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="relative z-10 flex flex-col gap-0"
    >
      <Hero />
      <TrustedBy />
      <ComparisonSection />
      <FeaturesGrid />
      <StartTrial />
    </motion.div>
  );
};