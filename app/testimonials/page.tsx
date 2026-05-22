import { redirect } from 'next/navigation';

// TODO: Re-enable when testimonials page is ready to go live
export default function TestimonialsPage() {
  redirect('/');
}

// 'use client';
//
// import { motion } from 'framer-motion';
//
// const testimonials = [
//   { name: 'Arjun Verma', gym: 'Muscle Hub, Sector 43, Gurugram', role: 'Gym Owner', content: 'Phool Gobhi has helped us increase our member base significantly. The platform is easy to use and brings consistent bookings throughout the week.', rating: 5 },
//   { name: 'Priya Sharma', gym: 'FitZone Fitness, Sector 12, Gurugram', role: 'Fitness Trainer', content: 'I love working with Phool Gobhi. My members love the flexibility and no long-term commitment. Session quality has improved.', rating: 5 },
//   { name: 'Rohit Kapoor', location: 'Gurugram', role: 'Gym Member', content: 'Found amazing gyms in Gurugram through Phool Gobhi. The pay-per-session model is perfect for my busy schedule.', rating: 5 },
//   { name: 'Deepika Singh', gym: '24 Hour Fitness, Sector 37, Gurugram', role: 'Manager', content: 'Our membership retention has improved since we partnered with Phool Gobhi. The platform adds value to our members.', rating: 5 },
//   { name: 'Vikram Patel', location: 'Gurugram', role: 'Fitness Enthusiast', content: 'I tried 5 different gyms in Gurugram before finding the right fit. Phool Gobhi made this journey so easy!', rating: 5 },
//   { name: 'Ananya Gupta', gym: 'CrossFit Arena, DLF Phase 1, Gurugram', role: 'Coach', content: 'Our coaching quality improved because we now attract members committed to their fitness goals. Phool Gobhi is a game-changer.', rating: 5 },
// ];
//
// export default function TestimonialsPage() {
//   return (
//     <section className="min-h-screen section-padding bg-gradient-to-b from-white to-emerald-50">
//       <div className="container-custom">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
//           <h1 className="text-5xl font-bold mb-4">Loved by Gyms & Members in Gurugram</h1>
//           <p className="text-xl text-gray-600">Join the fitness revolution. Hear from our community.</p>
//         </motion.div>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {testimonials.map((testimonial, index) => (
//             <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="p-8 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
//               <div className="mb-4">{[...Array(testimonial.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}</div>
//               <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
//               <div className="flex items-center justify-between border-t border-gray-200 pt-6">
//                 <div>
//                   <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
//                   <p className="text-sm text-emerald-600 font-semibold">{testimonial.gym ?? 'Gurugram'}</p>
//                   <p className="text-sm text-gray-600">{testimonial.role}</p>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
