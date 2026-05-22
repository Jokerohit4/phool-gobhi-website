import { redirect } from 'next/navigation';

// TODO: Re-enable when blog is ready to go live
export default function BlogPage() {
  redirect('/');
}

// 'use client';
//
// import { motion } from 'framer-motion';
//
// const posts = [
//   { id: 1, title: 'How to Start Your Fitness Journey in Gurugram', excerpt: 'Tips for beginners looking to join a gym in Gurugram.', category: 'Fitness Tips', date: 'May 1, 2024', author: 'Rohitashwa Singh', readTime: '5 min read' },
//   { id: 2, title: 'Flexible Gym Memberships: Why They Work', excerpt: 'Why flexibility matters in modern fitness.', category: 'Lifestyle', date: 'April 28, 2024', author: 'Priya Sharma', readTime: '7 min read' },
//   { id: 3, title: 'The Best Gyms in Gurugram for CrossFit', excerpt: 'A comprehensive guide to CrossFit gyms in the city.', category: 'Gym Guide', date: 'April 25, 2024', author: 'Arjun Patel', readTime: '6 min read' },
//   { id: 4, title: 'Post-Workout Nutrition: What You Need to Know', excerpt: 'Maximize your gains with proper post-workout nutrition.', category: 'Nutrition', date: 'April 22, 2024', author: 'Ananya Gupta', readTime: '8 min read' },
//   { id: 5, title: 'Budget Fitness: How to Stay Fit Without Breaking the Bank', excerpt: 'Affordable fitness options in Gurugram.', category: 'Budget Tips', date: 'April 19, 2024', author: 'Rohitashwa Singh', readTime: '5 min read' },
//   { id: 6, title: 'Building Consistency in Your Fitness Routine', excerpt: 'Proven strategies to stick with your workout plan.', category: 'Motivation', date: 'April 16, 2024', author: 'Priya Sharma', readTime: '6 min read' },
// ];
//
// export default function BlogPage() {
//   return (
//     <section className="min-h-screen section-padding bg-gradient-to-b from-white to-emerald-50">
//       <div className="container-custom">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
//           <h1 className="text-5xl font-bold mb-4">Phool Gobhi Blog</h1>
//           <p className="text-xl text-gray-600">Fitness tips, gym guides, and lifestyle insights</p>
//         </motion.div>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {posts.map((post, index) => (
//             <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
//               <div className="mb-4">
//                 <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">{post.category}</span>
//               </div>
//               <h3 className="text-lg font-bold mb-3">{post.title}</h3>
//               <p className="text-gray-600 mb-6">{post.excerpt}</p>
//               <div className="border-t border-gray-200 pt-4">
//                 <div className="flex justify-between items-center text-sm text-gray-600">
//                   <span>{post.date}</span>
//                   <span>{post.readTime}</span>
//                 </div>
//                 <p className="text-sm font-semibold text-gray-700 mt-2">By {post.author}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
