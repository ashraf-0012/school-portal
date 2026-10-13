import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import {
  GraduationCapIcon,
  BookOpenIcon,
  AwardIcon,
  UsersIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldCrestIcon,
} from '../../components/icons';
export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-wrapper">
        <div className="container">
          <div className="hero-grid">
            {/* Left Column: Headline and Call-to-Action */}
            <div className="flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="gold">Official School Portal</Badge>
                <Badge variant="sky">JSS 1 – SSS 3 Education</Badge>
              </div>

              <h1 className="heading-xl" style={{ color: 'var(--color-text-inverse)' }}>
                Fostering Academic Distinction, Character & Leadership
              </h1>

              <p className="text-lead" style={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: '640px' }}>
                Welcome to <strong>Crestfield Academy</strong>. We deliver a rigorous,
                disciplined secondary school education rooted in high moral standards, preparation
                for national examinations, and empowering future leaders.
              </p>

              <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
                <Link to="/login">
                  <Button variant="gold" size="lg">
                    Access Portal <ArrowRightIcon size={18} />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline-gold" size="lg">
                    Discover Our Vision
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Large School Hero Photograph */}
            <div>
              <div className="hero-image-box">
                <img
                  src="/images/hero-campus.png"
                  alt="Representative photograph of school campus architecture and students"
                  className="hero-image"
                />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Academics Section (JSS & SSS) */}
      <section className="section section-alt">
        <div className="container">
          <div className="flex-col gap-2" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-8)' }}>
            <span className="badge badge-navy" style={{ alignSelf: 'center' }}>Academic Pathways</span>
            <h2 className="heading-lg">Comprehensive Secondary Curriculum</h2>
            <p className="text-muted">
              Structured learning tracks engineered for intellectual discovery, mastery of core subjects,
              and seamless matriculation into higher institutions.
            </p>
          </div>

          <div className="grid grid-3">
            {/* Junior Secondary */}
            <Card featured interactive className="flex-col gap-3">
              <div className="school-crest">
                <BookOpenIcon size={22} />
              </div>
              <h3 className="heading-sm">Junior Secondary School (JSS 1 – 3)</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Foundational general education covering mathematics, English, basic sciences, and
                pre-vocational studies, culminating in state and national Basic Education Certificate Examinations.
              </p>
              <ul style={{ listStyle: 'none', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="flex items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircleIcon size={16} className="text-gold" />
                  <span>Foundational STEM & Languages</span>
                </li>
                <li className="flex items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircleIcon size={16} className="text-gold" />
                  <span>BECE Examination Focus</span>
                </li>
              </ul>
            </Card>

            {/* Senior Secondary */}
            <Card featured interactive className="flex-col gap-3">
              <div className="school-crest">
                <GraduationCapIcon size={22} />
              </div>
              <h3 className="heading-sm">Senior Secondary School (SSS 1 – 3)</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Advanced specialised streams in Pure Sciences, Commercial Studies, and Arts & Humanities,
                tailored to ensure distinction in WAEC, NECO, and UTME/JAMB exams.
              </p>
              <ul style={{ listStyle: 'none', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="flex items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircleIcon size={16} className="text-gold" />
                  <span>Science, Arts & Commercial Tracks</span>
                </li>
                <li className="flex items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircleIcon size={16} className="text-gold" />
                  <span>Senior Certificate Preparation</span>
                </li>
              </ul>
            </Card>

            {/* Holistic Discipline */}
            <Card featured interactive className="flex-col gap-3">
              <div className="school-crest">
                <UsersIcon size={22} />
              </div>
              <h3 className="heading-sm">Extracurriculars & School Houses</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Inter-house athletic sports, literary and debating clubs, robotics and science exhibitions,
                and moral mentorship fostering well-rounded maturity.
              </p>
              <ul style={{ listStyle: 'none', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li className="flex items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircleIcon size={16} className="text-gold" />
                  <span>House Competitions & Sports</span>
                </li>
                <li className="flex items-center gap-2" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircleIcon size={16} className="text-gold" />
                  <span>Leadership & Moral Mentorship</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Core Values / Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: 'var(--space-10)' }}>
            <div className="flex-col gap-4">
              <span className="badge badge-gold" style={{ width: 'fit-content' }}>Institutional Pillars</span>
              <h2 className="heading-lg">Why Parents & Guardians Entrust Us With Their Children</h2>
              <p className="text-muted">
                Our educational philosophy combines academic rigor with unwavering disciplinary ethics.
                We believe in providing an environment where every young person is held to high standards
                and supported to reach their full potential.
              </p>

              <div className="flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div style={{ color: 'var(--color-gold-600)', marginTop: '2px' }}>
                    <AwardIcon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-navy-900)' }}>Academic Rigor & Examination Mastery</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Systematic syllabus coverage, regular term continuous assessments, and targeted test tutorials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div style={{ color: 'var(--color-gold-600)', marginTop: '2px' }}>
                    <ShieldCrestIcon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-navy-900)' }}>Uncompromising Character & Discipline</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Strict adherence to school values, punctuality, integrity, mutual respect, and neatness.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div style={{ color: 'var(--color-gold-600)', marginTop: '2px' }}>
                    <UsersIcon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-navy-900)' }}>Transparent Portal Management</h4>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Real-time result computation, digital gradebooks, and instant report access for teachers, students, and administration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Stat Box */}
            <div>
              <Card navy className="flex-col gap-6" style={{ padding: 'var(--space-8)' }}>
                <h3 className="heading-md" style={{ color: 'var(--color-gold-300)' }}>
                  Academic Highlights
                </h3>
                <div className="grid grid-2 gap-4">
                  <div style={{ borderLeft: '3px solid var(--color-gold-500)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>100%</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Curriculum Coverage Standard</div>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--color-gold-500)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>6 Levels</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>JSS 1 through SSS 3</div>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--color-gold-500)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>3 Terms</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Per Academic Session</div>
                  </div>
                  <div style={{ borderLeft: '3px solid var(--color-gold-500)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>3 Roles</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Admin, Teacher & Student Portals</div>
                  </div>
                </div>
                <Link to="/contact">
                  <Button variant="gold" size="md" className="w-full">
                    Make An Admission Inquiry
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Call to Action Banner */}
      <section className="section" style={{ backgroundColor: 'var(--color-navy-900)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="flex-col items-center gap-4">
            <h2 className="heading-lg" style={{ color: '#ffffff' }}>Ready to Access the School Portal?</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Students can view term results and subjects. Teachers can submit academic grades.
              Administrators maintain complete school governance.
            </p>
            <div className="flex items-center gap-3 flex-wrap" style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}>
              <Link to="/login">
                <Button variant="gold" size="lg">
                  Login to Portal <ArrowRightIcon size={18} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline-gold" size="lg">
                  Contact School Office
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
