import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  ShieldCrestIcon,
  AwardIcon,
  UsersIcon,
  CheckCircleIcon,
} from '../../components/icons';

export default function AboutPage() {
  const values = [
    { title: 'Academic Excellence', desc: 'Fostering intellectual curiosity, rigorous subject mastery, and continuous scholarly improvement.' },
    { title: 'Moral Integrity', desc: 'Instilling truthfulness, honor, accountability, and ethical responsibility in every facet of life.' },
    { title: 'Discipline & Order', desc: 'Promoting punctuality, self-control, personal dignity, and respect for institutional standards.' },
    { title: 'Leadership & Service', desc: 'Developing proactive, empathetic citizens equipped to make positive contributions to society.' },
  ];

  return (
    <div>
      {/* Header Banner */}
      <section className="section" style={{ backgroundColor: 'var(--color-navy-950)', color: '#ffffff', padding: 'var(--space-12) 0' }}>
        <div className="container">
          <div className="flex-col gap-3" style={{ maxWidth: '780px' }}>
            <Badge variant="gold">About Our Institution</Badge>
            <h1 className="heading-xl" style={{ color: '#ffffff' }}>
              About Crestfield Academy
            </h1>
            <p className="text-lead" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Dedicated to academic rigor, character building, and preparing young minds to thrive
              in modern society through disciplined secondary education.
            </p>
          </div>
        </div>
      </section>

      {/* Institutional Overview */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2 gap-8" style={{ alignItems: 'center' }}>
            <div className="flex-col gap-4">
              <span className="badge badge-navy" style={{ width: 'fit-content' }}>Institutional Overview</span>
              <h2 className="heading-lg">Committed to Educational Standards</h2>
              <p className="text-muted">
                <strong>Crestfield</strong> was established to provide secondary school students
                with an enriching environment that balances modern educational methodologies with time-tested
                standards of conduct and scholastic achievement.
              </p>
              <p className="text-muted">
                From Junior Secondary 1 through Senior Secondary 3, our academic framework prepares students
                systematically for basic and senior school certificates (BECE, WAEC, NECO) while nurturing
                creative thinking, technical literacy, and cooperative teamwork.
              </p>
              <div className="flex items-center gap-3">
                <Link to="/contact">
                  <Button variant="primary">Get in Touch</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">Portal Login</Button>
                </Link>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="flex-col gap-4">
              <Card featured className="flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCrestIcon size={22} className="text-gold" />
                  <h3 className="heading-md">Our Mission</h3>
                </div>
                <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
                  <em>"To cultivate a community of dedicated learners,
                  guided by moral excellence, academic thoroughness, and practical leadership skills capable
                  of meeting global standards."</em>
                </p>
              </Card>

              <Card featured className="flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AwardIcon size={22} className="text-navy" />
                  <h3 className="heading-md">Our Vision</h3>
                </div>
                <p className="text-muted" style={{ fontSize: '0.9375rem' }}>
                  <em>"To be recognized as a premier center of secondary
                  educational excellence that produces upright, forward-thinking scholars across all disciplines."</em>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="flex-col gap-2" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-8)' }}>
            <span className="badge badge-gold" style={{ alignSelf: 'center' }}>Guiding Principles</span>
            <h2 className="heading-lg">Our Core Values</h2>
            <p className="text-muted">The moral and behavioral foundations expected of all students, faculty, and leadership.</p>
          </div>

          <div className="grid grid-4">
            {values.map((v, i) => (
              <Card key={i} interactive className="flex-col gap-2">
                <div style={{ color: 'var(--color-gold-600)', fontWeight: 800, fontSize: '1.25rem' }}>
                  0{i + 1}
                </div>
                <h3 className="heading-sm">{v.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Environment Info Placeholder */}
      <section className="section">
        <div className="container">
          <Card navy className="p-8">
            <div className="flex-col gap-4" style={{ maxWidth: '800px' }}>
              <Badge variant="gold">Campus & Facilities</Badge>
              <h2 className="heading-lg" style={{ color: '#ffffff' }}>Structured Learning Environment</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)' }}>
                Campus Facilities: Fully equipped science laboratories, ICT resource centers,
                 school library, sports grounds, and spacious classrooms designed to promote focused learning.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="badge badge-sky">Science Labs </span>
                <span className="badge badge-sky">ICT Suite</span>
                <span className="badge badge-sky">Library & Media Center</span>
                <span className="badge badge-sky">Athletic Fields</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
