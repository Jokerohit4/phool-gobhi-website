import { redirect } from 'next/navigation';

// TODO: Re-enable when gym listing is ready to go live
export default function GymsPage() {
  redirect('/');
}

// 'use client';
//
// import { useState } from 'react';
// import { motion } from 'framer-motion';
//
// const gyms = [
//   { id: 1, name: 'Muscle Hub', location: 'Sector 43, Gurugram', price: '₹299/session', rating: 4.8, reviews: 234, equipment: ['Dumbbells', 'Cardio', 'Strength'], image: '💪' },
//   { id: 2, name: 'FitZone Fitness', location: 'Sector 12, Gurugram', price: '₹249/session', rating: 4.7, reviews: 189, equipment: ['Yoga', 'Cardio', 'Crossfit'], image: '🏋️' },
//   { id: 3, name: '24 Hour Fitness', location: 'Sector 37, Gurugram', price: '₹199/session', rating: 4.6, reviews: 412, equipment: ['All Equipment', 'Personal Training', 'Group Classes'], image: '⚡' },
//   { id: 4, name: 'CrossFit Arena', location: 'DLF Phase 1, Gurugram', price: '₹399/session', rating: 4.9, reviews: 156, equipment: ['Crossfit', 'Olympic Lifting', 'Mobility'], image: '🔥' },
// ];
//
// export default function GymsPage() {
//   const [search, setSearch] = useState('');
//   const [filter, setFilter] = useState('all');
//
//   const filteredGyms = gyms.filter((gym) => {
//     const matchesSearch = gym.name.toLowerCase().includes(search.toLowerCase());
//     const matchesFilter = filter === 'all' || gym.equipment.some((e) => e.includes(filter));
//     return matchesSearch && matchesFilter;
//   });
//
//   return (
//     <section className="min-h-screen section-padding bg-white">
//       <div className="container-custom">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
//           <h1 className="text-5xl font-bold mb-4">Find Gyms in Gurugram</h1>
//           <p className="text-xl text-gray-600">Discover the best fitness centers near you</p>
//         </motion.div>
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-12 space-y-4">
//           <input type="text" placeholder="Search gyms..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-600" />
//           <div className="flex gap-2 flex-wrap">
//             {['all', 'Cardio', 'Strength', 'Yoga', 'Crossfit'].map((item) => (
//               <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === item ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
//                 {item.charAt(0).toUpperCase() + item.slice(1)}
//               </button>
//             ))}
//           </div>
//         </motion.div>
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {filteredGyms.map((gym, index) => (
//             <motion.div key={gym.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-shadow border border-emerald-200">
//               <div className="text-5xl mb-4 text-center">{gym.image}</div>
//               <h3 className="text-lg font-bold mb-2">{gym.name}</h3>
//               <p className="text-gray-600 text-sm mb-4">{gym.location}</p>
//               <div className="flex items-center justify-between mb-4">
//                 <span className="font-bold text-emerald-600">{gym.price}</span>
//                 <span className="text-sm text-yellow-600">★ {gym.rating} ({gym.reviews})</span>
//               </div>
//               <div className="mb-6">
//                 <p className="text-xs text-gray-600 font-semibold mb-2">Equipment:</p>
//                 <div className="flex flex-wrap gap-1">
//                   {gym.equipment.map((item, idx) => (
//                     <span key={idx} className="text-xs bg-white px-2 py-1 rounded text-gray-700">{item}</span>
//                   ))}
//                 </div>
//               </div>
//               <button className="w-full py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">Book Session</button>
//             </motion.div>
//           ))}
//         </div>
//         {filteredGyms.length === 0 && (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
//             <p className="text-xl text-gray-600">No gyms found. Try adjusting your search.</p>
//           </motion.div>
//         )}
//       </div>
//     </section>
//   );
// }
