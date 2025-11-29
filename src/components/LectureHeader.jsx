import { BookOpen, GraduationCap } from 'lucide-react';

export function LectureHeader({ title, description, instructor }) {
  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-center gap-2 text-primary mb-2">
        <GraduationCap className="w-5 h-5" />
        <span className="text-sm font-medium">Video Lecture</span>
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {instructor && (
        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Instructor: {instructor}</span>
        </div>
      )}
    </header>
  );
}
