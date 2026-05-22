import { redirect } from 'next/navigation';

// TODO: Re-enable when how-it-works page is ready to go live
export default function HowItWorksPage() {
  redirect('/');
}

// 'use client';
//
// import { motion } from 'framer-motion';
//
// const steps = [
//   { number: 1, icon: '🔍', title: 'Search & Discover', description: 'Browse hundreds of gyms in Gurugram. Filter by location, equipment, price, and ratings.', details: ['Real-time availability', 'Detailed gym profiles', 'Member reviews and ratings', 'Equipment & facilities list'] },
//   { number: 2, icon: '📅', title: 'Book Your Session', description: 'Choose your preferred time slot and book a session instantly.', details: ['Flexible scheduling', 'Instant confirmation', 'Easy rescheduling', 'No cancellation fees'] },
//   { number: 3, icon: '💳', title: 'Pay & Get Access', description: 'Secure payment through multiple options. Get instant access to the gym.', details: ['Multiple payment options', 'Secure transactions', 'Transparent pricing', 'Digital pass delivery'] },
//   { number: 4, icon: '🏋️', title: 'Enjoy Your Workout', description: 'Show your digital pass and start your fitness journey.', details: ['Professional equipment', 'Expert trainers', 'Great atmosphere', 'Community support'] },
// ];
//
// export default function HowItWorksPage() {
//   return (
//     <section className="min-h-screen section-padding bg-gradient-to-b from-white to-emerald-50">
//       <div className="container-custom">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
//           <h1 className="text-5xl font-bold mb-4">How Phool Gobhi Works</h1>
//           <p className="text-xl text-gray-600">Get started in 4 simple steps</p>
//         </motion.div>
//         <div className="space-y-12">
//           {steps.map((step, index) => (
//             <motion.div key={step.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className={`flex gap-12 items-center ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
//               <div className="flex-1">
//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">{step.number}</div>
//                   <h3 className="text-2xl font-bold">{step.title}</h3>
//                 </div>
//                 <p className="text-gray-600 mb-6 text-lg">{step.description}</p>
//                 <ul className="space-y-2">
//                   {step.details.map((detail, idx) => (
//                     <li key={idx} className="flex items-center gap-3">
//                       <span className="text-emerald-600 font-bold">✓</span>
//                       <span className="text-gray-700">{detail}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="flex-1 flex justify-center">
//                 <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-9xl">{step.icon}</motion.div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//         <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mt-20 p-12 rounded-xl bg-white border-2 border-emerald-200">
//           <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Phool Gobhi?</h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             <div><h4 className="text-xl font-bold mb-3">⏱️ No Long-Term Contracts</h4><p className="text-gray-600">Book sessions as needed. Cancel anytime without penalties.</p></div>
//             <div><h4 className="text-xl font-bold mb-3">💰 Transparent Pricing</h4><p className="text-gray-600">See exactly what you pay. No hidden fees or surprises.</p></div>
//             <div><h4 className="text-xl font-bold mb-3">🎯 Best Gyms</h4><p className="text-gray-600">Access premium gyms across Gurugram on one platform.</p></div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }
