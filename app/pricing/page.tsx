import { redirect } from 'next/navigation';

// TODO: Re-enable when pricing page is ready to go live
export default function PricingPage() {
  redirect('/');
}

// import PricingSection from '@/components/PricingSection';
//
// export default function PricingPage() {
//   return (
//     <section className="min-h-screen section-padding bg-gradient-to-b from-white to-emerald-50">
//       <div className="container-custom">
//         <div className="text-center mb-16">
//           <h1 className="text-5xl font-bold mb-4">Simple Transparent Pricing</h1>
//           <p className="text-xl text-gray-600">Choose the plan that fits your fitness goals</p>
//         </div>
//         <PricingSection />
//         <div className="mt-16 bg-white rounded-xl p-8 border border-gray-200">
//           <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
//           <div className="space-y-6">
//             <div>
//               <h3 className="font-bold text-lg mb-2">Can I switch plans anytime?</h3>
//               <p className="text-gray-600">Yes! You can upgrade or downgrade your plan anytime without any penalties.</p>
//             </div>
//             <div>
//               <h3 className="font-bold text-lg mb-2">What if I want to cancel?</h3>
//               <p className="text-gray-600">You can cancel anytime. No hidden fees or long-term commitments.</p>
//             </div>
//             <div>
//               <h3 className="font-bold text-lg mb-2">Are there any hidden charges?</h3>
//               <p className="text-gray-600">No! The price you see is exactly what you pay. Complete transparency.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
