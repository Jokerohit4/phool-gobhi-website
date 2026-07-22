export interface BlogPostSection {
  heading?: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  sections: BlogPostSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-start-your-fitness-journey-in-gurugram',
    title: 'How to Start Your Fitness Journey in Gurugram',
    excerpt: 'A beginner-friendly guide to picking a gym, trying it out, and actually sticking with it — without signing anything for a year first.',
    category: 'Fitness Tips',
    date: 'July 20, 2026',
    author: 'Rohitashwa Singh',
    readTime: '5 min read',
    sections: [
      {
        paragraphs: [
          'Most people don’t skip the gym because they don’t want to work out. They skip it because starting feels like a bigger decision than it should be — pick the right gym, sign a 12-month contract, hope it works out. That much upfront commitment is a lot to ask before you’ve even tried the treadmill.',
          'Here’s a simpler way to think about it: treat your first few weeks as an experiment, not a decision.',
        ],
      },
      {
        heading: 'Figure Out What Kind of Workout Actually Sticks',
        paragraphs: [
          'Not every gym works for every person, and that’s fine. Some people need the structure of a class (Zumba, HIIT, spin); others want a quiet corner with a barbell and headphones. If you’ve never worked out consistently before, you genuinely don’t know which one you are yet — and that’s the whole point of trying a few different setups before locking into one.',
        ],
      },
      {
        heading: 'Try Before You Commit',
        paragraphs: [
          'This is where most gym-hunting advice falls apart in India: it assumes you can freely sample a few gyms before choosing. In practice, most gyms only sell monthly or annual memberships, so "trying" one means paying for a full month whether you go three times or thirty.',
          'Pay-per-session platforms (Phool Gobhi being one of them, since we’re obviously biased) exist specifically to close that gap — you book and pay for a single visit, see how the equipment, crowd, and trainers feel, and decide from there. No sunk cost if it’s not a fit.',
        ],
      },
      {
        heading: 'What to Check Before Your First Session',
        paragraphs: [
          'A few things are worth confirming before you show up: whether the equipment you actually plan to use is available (not just "has a gym" but "has the machines you want"), what the crowd looks like at your preferred time slot, whether trainers are floor-available or appointment-only, and basic hygiene — clean mats, working showers, decent ventilation.',
        ],
      },
      {
        heading: 'Your First Week Checklist',
        paragraphs: [
          'Book one session, not five. Show up with a simple plan — even "20 minutes cardio, 20 minutes machines" is enough for day one. Don’t chase soreness; consistency beats intensity in week one. And don’t judge the whole experience off a single bad session — try the same gym at a different time before writing it off.',
          'Once you’ve found a place that actually fits your schedule and workout style, browsing verified gyms near you on Phool Gobhi is a good next step — no membership required to get started, just book a session and go.',
        ],
      },
    ],
  },
  {
    slug: 'flexible-gym-memberships-why-they-work',
    title: 'Flexible Gym Memberships: Why They Work',
    excerpt: 'The case against 12-month gym contracts — and what actually happens when you switch to paying per session instead.',
    category: 'Lifestyle',
    date: 'July 17, 2026',
    author: 'Rohitashwa Singh',
    readTime: '7 min read',
    sections: [
      {
        paragraphs: [
          'Annual gym memberships are sold on a simple pitch: commit for a year, get a better rate. What that pitch conveniently skips is what happens after month three, when life gets in the way and the membership just becomes a monthly charge you feel vaguely guilty about.',
        ],
      },
      {
        heading: 'The Sunk-Cost Trap of Annual Memberships',
        paragraphs: [
          'Once you’ve paid for the year, the money is gone whether you show up or not — which means every missed week feels like wasted money, but that guilt rarely translates into actually going more. It just adds a layer of stress to something that was supposed to make you feel better.',
        ],
      },
      {
        heading: 'Life Doesn’t Move in 12-Month Blocks',
        paragraphs: [
          'Work travel, a new job across town, an injury that benches you for six weeks, moving apartments, a busy quarter — none of these care what your membership contract says. A flexible pay-per-session model just means your fitness spending matches your actual life, instead of the other way around.',
        ],
      },
      {
        heading: 'What "Pay Per Session" Actually Means in Practice',
        paragraphs: [
          'It’s exactly what it sounds like: you book a specific session at a specific gym, pay for that visit, and that’s it. No auto-renewal, no annual lock-in, no fee for the months you don’t go. If your schedule changes next month, nothing carries over that you need to "use up."',
        ],
      },
      {
        heading: 'When a Membership Still Makes Sense',
        paragraphs: [
          'To be fair to memberships: if you already know exactly which gym you’ll use, at exactly what frequency, for the foreseeable future, a membership can work out cheaper per visit. The problem is most people don’t actually know that going in — which is exactly why starting with single sessions, and only switching to a longer plan once your routine is genuinely stable, is the lower-risk order to do things in.',
          'If you’re at the "figuring it out" stage, that’s what pay-per-session booking on Phool Gobhi is built for.',
        ],
      },
    ],
  },
  {
    slug: 'best-gyms-in-gurugram-for-crossfit',
    title: 'The Best Gyms in Gurugram for CrossFit',
    excerpt: 'CrossFit boxes vary a lot more than a quick Instagram scroll suggests. Here’s what to actually evaluate before you commit to one.',
    category: 'Gym Guide',
    date: 'July 14, 2026',
    author: 'Rohitashwa Singh',
    readTime: '6 min read',
    sections: [
      {
        paragraphs: [
          'CrossFit has grown fast in Gurugram over the last few years, and with that growth comes a wide range of quality — from genuinely well-coached boxes to gyms that slapped a "CrossFit-style" sign on a regular weights floor. The difference matters more here than in most gym formats, because bad coaching in CrossFit specifically tends to show up as injuries, not just wasted time.',
        ],
      },
      {
        heading: 'What Actually Matters in a CrossFit Box',
        paragraphs: [
          'Coaching quality is the single biggest variable — ask whether coaches are certified and whether they actually watch and correct your form during a WOD, or just call out the clock. Class size matters too: a coach watching 20 people can’t catch bad form the way one watching 8 can. And check equipment condition directly — worn grips, cracked bumper plates, and rusted rig joints are signs of a box that isn’t reinvesting in safety.',
        ],
      },
      {
        heading: 'Questions to Ask Before Your First WOD',
        paragraphs: [
          'Is there a scaling option for every movement, or is everyone expected to do the exact prescribed weight regardless of experience? Will someone walk you through unfamiliar movements (snatches, muscle-ups, box jumps) before throwing you into a timed workout? What’s the actual injury history the box is willing to talk about openly?',
        ],
      },
      {
        heading: 'Injury Red Flags to Watch For',
        paragraphs: [
          'As a beginner specifically: if a coach pushes you to hit prescribed weight or reps before your form is solid, that’s a red flag, not dedication. Good boxes slow beginners down on purpose. If nobody’s correcting your form in your first few sessions, that’s worth noticing.',
        ],
      },
      {
        heading: 'Try a Drop-In Before You Commit',
        paragraphs: [
          'CrossFit boxes are exactly the kind of gym where a single trial session tells you more than any review ever will — you can feel the coaching quality and community in one WOD. We’re still onboarding gym partners across Gurugram on Phool Gobhi, so the list of CrossFit-tagged boxes is growing rather than exhaustive right now — but wherever it’s available, booking one drop-in session before committing anywhere is the safest way to evaluate a box.',
        ],
      },
    ],
  },
  {
    slug: 'post-workout-nutrition-what-you-need-to-know',
    title: 'Post-Workout Nutrition: What You Need to Know',
    excerpt: 'Cutting through the "anabolic window" myths — what actually matters for recovery, and simple India-friendly meals that cover it.',
    category: 'Nutrition',
    date: 'July 11, 2026',
    author: 'Rohitashwa Singh',
    readTime: '8 min read',
    sections: [
      {
        paragraphs: [
          'A lot of gym-bro advice makes post-workout nutrition sound like a ticking clock — eat protein within 30 minutes or lose your gains. The real picture is more forgiving than that, but there are still a few things worth getting right.',
        ],
      },
      {
        heading: 'The "Anabolic Window" Is Wider Than You Think',
        paragraphs: [
          'The strict 30-minute rule is outdated. What actually matters more is your total daily protein and calorie intake — eating well across the day matters far more than hitting a precise timer after your last set. That said, having a meal within a couple of hours of training is a reasonable, practical habit, mostly because it makes it more likely you actually eat enough that day rather than skipping meals out of post-workout fatigue.',
        ],
      },
      {
        heading: 'Protein: How Much Is Enough',
        paragraphs: [
          'For people training regularly, roughly 1.6–2.2 grams of protein per kilogram of bodyweight per day is a commonly cited range in sports nutrition — spread across your meals, not crammed into one shake. If you weigh 70kg, that’s somewhere around 110–150g a day, which is very achievable through food alone for most people.',
        ],
      },
      {
        heading: 'Don’t Forget Carbs and Fluids',
        paragraphs: [
          'Protein gets all the attention, but carbs refill the glycogen your muscles just burned through, and skipping them consistently is a common reason people feel flat in their next session. Rehydrating matters just as much, especially if you’re training in Gurugram’s heat for a good chunk of the year — plain water is fine for most session lengths; you don’t need a sports drink for a 45-minute workout.',
        ],
      },
      {
        heading: 'Simple Post-Workout Meals and Snacks',
        paragraphs: [
          'You don’t need imported supplements to get this right. Paneer or eggs with a roti, a banana with peanut butter, sprouts chaat, dal with rice, buttermilk with roasted chana, or a basic whey shake if you’re short on time — any of these cover protein and carbs without much planning.',
          'Fuel the session properly, and we’ll handle making the booking part easy — browse gyms near you on Phool Gobhi whenever you’re ready for the next one.',
        ],
      },
    ],
  },
  {
    slug: 'budget-fitness-how-to-stay-fit-without-breaking-the-bank',
    title: 'Budget Fitness: How to Stay Fit Without Breaking the Bank',
    excerpt: 'Staying in shape doesn’t require a premium membership — here’s how to build a routine that actually fits your budget.',
    category: 'Budget Tips',
    date: 'July 8, 2026',
    author: 'Rohitashwa Singh',
    readTime: '5 min read',
    sections: [
      {
        paragraphs: [
          'Fitness content online is dominated by premium gear, premium supplements, and premium memberships — which makes it easy to forget that staying fit is mostly about consistency, not spend.',
        ],
      },
      {
        heading: 'Free and Near-Free Options',
        paragraphs: [
          'Most Gurugram sectors have parks with outdoor exercise equipment and walking tracks that cost nothing to use. Bodyweight routines (push-ups, squats, planks, lunges) build real strength with zero equipment, and there’s no shortage of free, well-structured workout videos online if you want some structure without a trainer.',
        ],
      },
      {
        heading: 'The Real Cost of a Membership You Don’t Use',
        paragraphs: [
          'Industry data suggests 70–80% of Indian gym members don’t renew past their first year — a lot of that drop-off happens because people pay upfront for consistency they didn’t actually build yet. An unused annual membership is, in a very literal sense, the most expensive workout you never did.',
        ],
      },
      {
        heading: 'How Pay-Per-Session Can Actually Cost Less',
        paragraphs: [
          'If you’re realistically going to train 2–3 times a week, paying per session often works out cheaper than an annual membership sized for someone going 5 times a week — because you’re only ever paying for the sessions you actually use, not a flat rate designed around best-case attendance.',
        ],
      },
      {
        heading: 'Budgeting for Consistency Without Overspending',
        paragraphs: [
          'A practical approach: start with free options to build the habit, add 1–2 paid sessions a week once you’re showing up consistently, and only consider a membership once you know your real frequency. That order avoids paying upfront for a routine you haven’t proven to yourself yet.',
        ],
      },
    ],
  },
  {
    slug: 'building-consistency-in-your-fitness-routine',
    title: 'Building Consistency in Your Fitness Routine',
    excerpt: 'Motivation fades. Here’s how to build a routine that survives the weeks when it does.',
    category: 'Motivation',
    date: 'July 5, 2026',
    author: 'Rohitashwa Singh',
    readTime: '6 min read',
    sections: [
      {
        paragraphs: [
          'Almost everyone starts a fitness routine motivated. Motivation is also, reliably, the least dependable thing to build a habit on — it comes and goes on its own schedule, not yours. What actually keeps people showing up long-term is friction removed, not willpower added.',
        ],
      },
      {
        heading: 'Habit Stacking: Attach Workouts to Existing Routines',
        paragraphs: [
          'Instead of relying on remembering to work out, attach it to something you already do without thinking — right after you drop your kid at school, right before you shower in the evening, right after your last meeting on Tuesdays. The workout becomes the next step in an existing chain, not a separate decision you have to make from scratch every day.',
        ],
      },
      {
        heading: 'Lower the Barrier to Starting',
        paragraphs: [
          'A lot of consistency problems are really just friction problems — a gym that’s inconveniently located, a membership that makes switching gyms feel wasteful, a plan that’s too rigid for a busy week. Being able to book a single session at whichever gym is actually convenient that day removes a surprising amount of the "I’ll go tomorrow" excuse.',
        ],
      },
      {
        heading: 'Track Something, Even If It’s Small',
        paragraphs: [
          'You don’t need an elaborate tracking system — a simple streak, a sessions-this-month count, or just a note of how you felt after each workout is enough to give you visible proof that it’s working, which matters far more for consistency than any specific metric.',
        ],
      },
      {
        heading: 'What to Do When You Miss a Week',
        paragraphs: [
          'You will miss a week eventually — travel, illness, a genuinely busy stretch at work. The habit-killer isn’t the missed week itself, it’s the all-or-nothing thinking that follows it ("I’ve already broken my streak, might as well restart next month"). Treat a missed week as a missed week, not a failed routine, and just book your next session.',
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
