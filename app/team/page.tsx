import { redirect } from 'next/navigation';

// TODO: Re-enable when team page is ready to go live
export default function TeamPage() {
  redirect('/');
}

// 'use client';
//
// import { motion } from 'framer-motion';
//
// const team = [
//   { name: 'Rohitashwa Singh', role: 'Founder & CEO', bio: 'Flutter developer turned fitness entrepreneur. Building Phool Gobhi to make fitness accessible.', avatar: '👨‍💼' },
//   { name: 'Priya Sharma', role: 'Head of Operations', bio: 'Expert in gym partnerships and member success. Ensuring every interaction adds value.', avatar: '👩‍💼' },
//   { name: 'Arjun Patel', role: 'Marketing Lead', bio: 'Fitness enthusiast and marketing strategist. Growing the Phool Gobhi community in Gurugram.', avatar: '👨‍💻' },
//   { name: 'Ananya Gupta', role: 'Community Manager', bio: 'Passionate about fitness and community building. Your voice at Phool Gobhi.', avatar: '👩‍💻' },
// ];
//
// export default function TeamPage() {
//   return (
//     <section className="min-h-screen section-padding bg-white">
//       <div className="container-custom">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
//           <h1 className="text-5xl font-bold mb-4">Meet Our Team</h1>
//           <p className="text-xl text-gray-600">Passionate about making fitness accessible</p>
//         </motion.div>
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {team.map((member, index) => (
//             <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="p-8 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 text-center hover:shadow-lg transition-shadow">
//               <div className="text-6xl mb-4 flex justify-center">{member.avatar}</div>
//               <h3 className="text-xl font-bold mb-1">{member.name}</h3>
//               <p className="text-emerald-600 font-semibold mb-4">{member.role}</p>
//               <p className="text-gray-600 text-sm">{member.bio}</p>
//             </motion.div>
//           ))}
//         </div>
//         <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }} className="mt-16 p-12 rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 text-white text-center">
//           <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
//           <p className="text-emerald-100 mb-6">We're hiring talented individuals passionate about fitness and technology.</p>
//           <a href="mailto:hello@phoolGobhi.in" className="inline-block px-8 py-3 rounded-lg bg-white text-emerald-600 font-bold hover:bg-emerald-50 transition-colors">Send Your Resume</a>
//         </motion.div>
//       </div>
//     </section>
//   );
// }
