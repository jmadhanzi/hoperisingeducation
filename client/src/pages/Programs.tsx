/* Hope Rising Education — Programs Page */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { BookOpen, GraduationCap, Users, Utensils, Heart, Shield, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO } from "@/lib/seo";
import { HOPE_RISING_MEDIA } from "@/lib/media";

const HERO_IMG = HOPE_RISING_MEDIA.hopeRisingSupplies;
const CURRICULUM_IMG = HOPE_RISING_MEDIA.studentsWithBooks;

const programs = [
  {
    id: "my-best-me",
    icon: Sparkles,
    title: "My Best Me Curriculum",
    subtitle: "Flagship Program",
    color: "#EE701E",
    img: CURRICULUM_IMG,
    desc: "The My Best Me curriculum is Hope Rising Education's flagship program — a multimedia-rich, age-appropriate learning experience designed to cultivate hope, resilience, and emotional intelligence in children.",
    outcomes: [
      "Improved emotional regulation and self-awareness",
      "Stronger peer relationships and social skills",
      "Increased academic engagement and attendance",
      "Reduced behavioral issues in the classroom",
      "Enhanced psycho-social development",
    ],
    details: "Available in both digital and print formats, the curriculum is delivered in weekly sessions by trained facilitators. Each lesson integrates storytelling, art, movement, and discussion to engage diverse learning styles.",
  },
  {
    id: "school-support",
    icon: GraduationCap,
    title: "School Fees & Supplies",
    subtitle: "Financial Support",
    color: "#0D215C",
    img: HOPE_RISING_MEDIA.studentWithPencils,
    desc: "Financial barriers are the primary reason children drop out of school in Zimbabwe. We cover school fees, uniforms, textbooks, stationery, and other essential supplies so no child is left behind.",
    outcomes: [
      "Zero financial barriers to school enrollment",
      "Full uniform and supply provision",
      "Textbooks and stationery for every student",
      "Reduced dropout rates in supported communities",
      "Increased female enrollment and retention",
    ],
    details: "We work directly with school administrators to pay fees on behalf of enrolled children, ensuring funds reach their intended purpose with full accountability.",
  },
  {
    id: "tutoring",
    icon: Users,
    title: "Tutoring & Mentorship",
    subtitle: "Academic Support",
    color: "#4BAF4F",
    img: HOPE_RISING_MEDIA.aiClassroomMentor,
    desc: "One-on-one and small-group tutoring sessions help children who are falling behind catch up with their peers. Dedicated mentors provide consistent guidance and encouragement throughout the school year.",
    outcomes: [
      "Improved grades across core subjects",
      "Stronger reading and numeracy skills",
      "Consistent adult mentorship relationships",
      "Increased confidence and self-efficacy",
      "Better preparation for national examinations",
    ],
    details: "Tutors are trained volunteers and local educators who receive ongoing professional development. Each child is matched with a mentor who meets with them weekly.",
  },
  {
    id: "nutrition",
    icon: Utensils,
    title: "Nutrition & Meals",
    subtitle: "Health & Wellbeing",
    color: "#EE701E",
    img: HOPE_RISING_MEDIA.aiNutrition,
    desc: "Hunger is a significant barrier to learning. We provide warm, nutritious meals daily to children in our programs, ensuring they have the energy and focus needed to engage fully in their education.",
    outcomes: [
      "Improved concentration and classroom engagement",
      "Reduced absenteeism linked to hunger",
      "Better overall health and development",
      "Increased school attendance rates",
      "Stronger physical and cognitive development",
    ],
    details: "Meals are prepared by local community members using locally-sourced ingredients, supporting both child nutrition and the local economy.",
  },
  {
    id: "psychosocial",
    icon: Heart,
    title: "Psycho-Social Support",
    subtitle: "Mental Health",
    color: "#0D215C",
    img: HOPE_RISING_MEDIA.aiCounseling,
    desc: "Many children in our communities have experienced trauma, loss, or significant stress. Our trained counselors and safe spaces provide the emotional support children need to heal and thrive.",
    outcomes: [
      "Reduced symptoms of anxiety and depression",
      "Improved emotional resilience",
      "Healthier peer and family relationships",
      "Better coping strategies for adversity",
      "Increased sense of hope and self-worth",
    ],
    details: "Counseling sessions are conducted individually and in groups, with referrals to professional mental health services when needed. All counselors are trained in trauma-informed care.",
  },
  {
    id: "safe-spaces",
    icon: Shield,
    title: "Safe Learning Environments",
    subtitle: "Infrastructure",
    color: "#4BAF4F",
    img: HOPE_RISING_MEDIA.classroomLineup,
    desc: "We build and maintain safe, welcoming classrooms and learning spaces equipped with the tools children need to thrive. A safe environment is the foundation of effective learning.",
    outcomes: [
      "Fully equipped classrooms with furniture and materials",
      "Safe, clean, and welcoming learning environments",
      "Access to clean water and sanitation facilities",
      "Hygiene education and supply distribution",
      "Community ownership of school infrastructure",
    ],
    details: "Infrastructure projects are community-led, with local families and leaders involved in planning, construction, and maintenance to ensure long-term sustainability.",
  },
];

export default function Programs() {
  const revealRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    el.querySelectorAll(".fade-up").forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" ref={revealRef}>
      <PageSEO
        title="Our Programs"
        description="Hope Rising Education runs six holistic programs for children in Zimbabwe: curriculum, school fees, tutoring, nutrition, psycho-social support, and safe learning environments."
        path="/programs"
      />
      <Navbar />

      {/* Hero */}
      <section id="main-content" className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden bg-[#0D215C]">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className="relative z-10 text-center text-white pt-16">
          <p className="text-xs text-white/60 mb-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>Home &rsaquo; Programs</p>
          <h1 className="text-4xl md:text-5xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif" }}>
            Our <span className="text-[#EE701E]">Programs</span>
          </h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto px-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Holistic, evidence-based programs that address every barrier between a child and quality education.
          </p>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto space-y-20">
          {programs.map(({ id, icon: Icon, title, subtitle, color, img, desc, outcomes, details }, i) => (
            <div
              key={id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center fade-up ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={img} alt={`${title} — Hope Rising Education program`} loading="lazy" className="w-full h-72 object-cover" />
                  <div className="absolute top-4 left-4">
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-white"
                      style={{ backgroundColor: color, fontFamily: "Hanken Grotesk, sans-serif" }}
                    >
                      {subtitle}
                    </span>
                  </div>
                </div>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: color + "20" }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0D215C] mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {title}
                </h2>
                <p className="text-[#584237] leading-relaxed mb-4" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{desc}</p>
                <p className="text-[#584237] leading-relaxed mb-5 text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{details}</p>
                <div className="space-y-2 mb-6">
                  <p className="font-bold text-[#0D215C] text-sm mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Key Outcomes:</p>
                  {outcomes.map((o) => (
                    <div key={o} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#4BAF4F] mt-0.5 shrink-0" />
                      <span className="text-[#584237] text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{o}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/donate?program=${encodeURIComponent(title)}`} className="btn-primary inline-flex items-center gap-2">
                  Fund This Program <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Partnerships */}
      <section className="py-20 bg-[#0D215C]">
        <div className="container mx-auto text-center">
          <p className="section-label text-[#EE701E] fade-up">Working Together</p>
          <span className="orange-underline mx-auto" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 fade-up stagger-2" style={{ fontFamily: "Manrope, sans-serif" }}>
            Community Partnerships
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 fade-up stagger-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Our programs succeed because we work hand-in-hand with local schools, community leaders, families, and government agencies. Sustainable change requires deep community ownership.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 fade-up stagger-4">
            {["Local Schools & Teachers", "Community Leaders", "Government Agencies", "International Donors", "Local Businesses", "Faith Communities"].map((partner) => (
              <div key={partner} className="bg-white/10 rounded-xl py-4 px-6">
                <p className="text-white font-medium" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#EE701E]">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 fade-up" style={{ fontFamily: "Manrope, sans-serif" }}>
            Help Fund Our Programs
          </h2>
          <p className="text-white/80 mb-6 fade-up stagger-2" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Your donation directly supports these life-changing programs for vulnerable children.
          </p>
          <Link href="/donate" className="inline-block bg-white text-[#EE701E] font-bold px-8 py-3 rounded-lg hover:bg-[#0D215C] hover:text-white transition-all duration-200 active:scale-[0.97] fade-up stagger-3" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            Donate Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
