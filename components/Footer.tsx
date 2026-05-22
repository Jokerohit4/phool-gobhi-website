'use client';

import Link from 'next/link';
import PhoolGobhiLogo from './PhoolGobhiLogo';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 mt-16 transition-colors overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute top-0 right-1/2 w-96 h-96 bg-emerald-900/20 rounded-full filter blur-3xl opacity-20 -z-10"></div>

      <div className="container-custom py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={{ y: -4 }}
              className="flex items-center gap-2 mb-4 w-fit"
            >
              <PhoolGobhiLogo />
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                Phool Gobhi
              </span>
            </motion.div>
            <p className="text-sm leading-relaxed font-medium text-gray-400 dark:text-gray-500">
              The world's most flexible gym membership platform. Premium fitness, your terms.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-white dark:text-gray-100 mb-4 text-lg">Product</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/gyms', label: 'Find Gyms' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/how-it-works', label: 'How It Works' },
              ].map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-white dark:text-gray-100 mb-4 text-lg">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/team', label: 'Team' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <motion.li
                  key={link.href}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={link.href}
                    className="hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-white dark:text-gray-100 mb-4 text-lg">Connect</h4>
            <ul className="space-y-3 text-sm">
              <motion.li whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <a
                  href="https://wa.me/919354859197"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
                >
                  WhatsApp: +91 9354859197
                </a>
              </motion.li>
              <motion.li whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <a
                  href="mailto:hello@phoolGobhi.in"
                  className="hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium"
                >
                  Email: hello@phoolGobhi.in
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 dark:border-gray-800 pt-8 origin-left"
        >
          <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-600">
            © 2024 Phool Gobhi. Premium fitness, your terms. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
