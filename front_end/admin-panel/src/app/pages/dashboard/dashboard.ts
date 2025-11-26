import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Student {
  id: number;
  name: string;
  age: number;
  class: string;
  marks: { [subject: string]: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Changed from FormsModule
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  students: Student[] = [];

  totalStudents = 0;
  avgScore = '0.0';
  topScore = 0;
  totalSubjects = 0;

  classes: string[] = [];
  allSubjects: string[] = [];
  availableSubjects: string[] = [];

  // Reactive Form
  filterForm!: FormGroup;

  barChart: any;
  pieChart: any;
  doughnutChart: any;
  stackedBarChart: any;

  toppers: { name: string; score: number }[] = [];

  private themeObserver: MutationObserver | null = null;

  constructor(private fb: FormBuilder) {}

  async ngOnInit() {
    this.initializeForm();
    await this.loadStudents();
    this.calculateStats();
    this.extractClassesAndSubjects();
    this.availableSubjects = [...this.allSubjects];
    this.observeThemeChanges();
    this.subscribeToFormChanges();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createAllCharts();
      this.updateToppersDisplay();
    }, 100);
  }

  ngOnDestroy() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    this.destroyAllCharts();
  }

  // Initialize Reactive Form
  initializeForm() {
    this.filterForm = this.fb.group({
      selectedClass: [''],
      selectedSubject: [''],
    });
  }

  // Subscribe to form value changes
  subscribeToFormChanges() {
    // Watch class changes
    this.filterForm.get('selectedClass')?.valueChanges.subscribe((selectedClass) => {
      this.updateAvailableSubjects(selectedClass);
      this.updateToppersDisplay();
    });

    // Watch subject changes
    this.filterForm.get('selectedSubject')?.valueChanges.subscribe(() => {
      this.updateToppersDisplay();
    });
  }

  observeThemeChanges() {
    const htmlElement = document.documentElement;

    this.themeObserver = new MutationObserver(() => {
      this.refreshCharts();
    });

    this.themeObserver.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  createAllCharts() {
    this.createBarChart();
    this.createPieChart();
    this.createDoughnutChart();
    this.createStackedBarChart();
  }

  destroyAllCharts() {
    if (this.barChart) this.barChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.stackedBarChart) this.stackedBarChart.destroy();
  }

  refreshCharts() {
    this.destroyAllCharts();
    setTimeout(() => {
      this.createAllCharts();
      this.updateToppersDisplay();
    }, 50);
  }

  getThemeColor(colorVar: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
  }

  async loadStudents() {
    try {
      const response = await fetch('assets/studentsData.json');
      const data = await response.json();
      this.students = data.students || [];
    } catch (error) {
      console.error('Data is not loaded:', error);
    }
  }

  calculateStats() {
    this.totalStudents = this.students.length;

    const subjectsSet = new Set<string>();
    let totalMarks = 0;
    let totalMarksCount = 0;
    let highestMark = 0;

    this.students.forEach((student) => {
      Object.entries(student.marks).forEach(([subject, mark]) => {
        subjectsSet.add(subject);
        totalMarks += mark;
        totalMarksCount++;
        if (mark > highestMark) {
          highestMark = mark;
        }
      });
    });

    this.avgScore = totalMarksCount > 0 ? (totalMarks / totalMarksCount).toFixed(1) : '0.0';
    this.topScore = highestMark;
    this.totalSubjects = subjectsSet.size;
  }

  extractClassesAndSubjects() {
    const classSet = new Set<string>();
    const subjectSet = new Set<string>();

    this.students.forEach((student) => {
      classSet.add(student.class);
      Object.keys(student.marks).forEach((subject) => {
        subjectSet.add(subject);
      });
    });

    this.classes = Array.from(classSet).sort();
    this.allSubjects = Array.from(subjectSet).sort();
  }

  updateAvailableSubjects(selectedClass: string) {
    if (!selectedClass) {
      this.availableSubjects = [...this.allSubjects];
    } else {
      const subjectsInClass = new Set<string>();
      this.students
        .filter((s) => s.class === selectedClass)
        .forEach((s) => {
          Object.keys(s.marks).forEach((subject) => {
            subjectsInClass.add(subject);
          });
        });
      this.availableSubjects = Array.from(subjectsInClass).sort();

      const currentSubject = this.filterForm.get('selectedSubject')?.value;
      if (currentSubject && !this.availableSubjects.includes(currentSubject)) {
        this.filterForm.patchValue({ selectedSubject: '' });
      }
    }
  }

  resetFilters() {
    this.filterForm.reset({
      selectedClass: '',
      selectedSubject: '',
    });
    this.availableSubjects = [...this.allSubjects];
    this.updateToppersDisplay();
  }

  isResetDisabled(): boolean {
    const selectedClass = this.filterForm.get('selectedClass')?.value;
    const selectedSubject = this.filterForm.get('selectedSubject')?.value;
    return !selectedClass && !selectedSubject;
  }

  getToppers(): { name: string; score: number; rank: number }[] {
    let filteredStudents = [...this.students];

    const selectedClass = this.filterForm.get('selectedClass')?.value;
    const selectedSubject = this.filterForm.get('selectedSubject')?.value;

    if (selectedClass) {
      filteredStudents = filteredStudents.filter((s) => s.class === selectedClass);
    }

    const studentScores = filteredStudents.map((student) => {
      let score: number;

      if (selectedSubject) {
        score = student.marks[selectedSubject] || 0;
      } else {
        const marks = Object.values(student.marks);
        score = marks.reduce((a, b) => a + b, 0) / marks.length;
      }

      return {
        name: student.name,
        score: parseFloat(score.toFixed(3)),
      };
    });

    studentScores.sort((a, b) => b.score - a.score);

    let rank = 1;
    let lastScore: number | null = null;
    let sameRankCount = 0;

    const rankedStudents = studentScores.map((student, index) => {
      if (lastScore === null || student.score < lastScore) {
        rank = index + 1;
        sameRankCount = 1;
      } else {
        sameRankCount++;
      }

      lastScore = student.score;
      return { ...student, rank };
    });

    const topRankCutoff = rankedStudents[2]?.rank ?? 3;
    return rankedStudents.filter((s) => s.rank <= topRankCutoff);
  }

  updateToppersDisplay() {
    this.toppers = this.getToppers();
  }

  createBarChart() {
    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    if (!ctx) return;

    const subjectsSet = new Set<string>();
    this.students.forEach((student) => {
      Object.keys(student.marks).forEach((sub) => subjectsSet.add(sub));
    });
    const subjects = Array.from(subjectsSet);

    const avgMarks = subjects.map((subject) => {
      const marks = this.students.map((s) => s.marks[subject]).filter((m) => m !== undefined);
      return marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
    });

    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f43f5e',
      '#06b6d4',
      '#84cc16',
      '#e11d48',
    ];

    const textColor = this.getThemeColor('--text-color');
    const gridColor = this.getThemeColor('--border-color');

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subjects,
        datasets: [
          {
            label: 'Average Marks',
            data: avgMarks,
            backgroundColor: colors.slice(0, subjects.length),
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      },
    });
  }

  createPieChart() {
    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!ctx) return;

    const ageGroups: { [key: string]: number } = {
      '19-20': 0,
      '21-22': 0,
      '23+': 0,
    };

    this.students.forEach((student) => {
      if (student.age <= 20) {
        ageGroups['19-20']++;
      } else if (student.age <= 22) {
        ageGroups['21-22']++;
      } else {
        ageGroups['23+']++;
      }
    });

    const labels = Object.keys(ageGroups);
    const data = Object.values(ageGroups);

    const textColor = this.getThemeColor('--text-color');

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ['#3b83f6ff', '#10b981ff', '#f59f0bff'],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 15,
            },
          },
        },
      },
    });
  }

  createStackedBarChart() {
    const ctx = document.getElementById('stackedBarChart') as HTMLCanvasElement;
    if (!ctx) return;

    const classGroups: { [key: string]: number[] } = {};

    this.students.forEach((student) => {
      const avgMarks =
        Object.values(student.marks).reduce((a, b) => a + b, 0) /
        Object.values(student.marks).length;

      if (!classGroups[student.class]) {
        classGroups[student.class] = [];
      }
      classGroups[student.class].push(avgMarks);
    });

    const classNames = Object.keys(classGroups);

    const avgScores = classNames.map((c) => {
      const arr = classGroups[c];
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    });

    const topScores = classNames.map((c) => Math.max(...classGroups[c]));

    const textColor = this.getThemeColor('--text-color');
    const gridColor = this.getThemeColor('--border-color');

    this.stackedBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: classNames,
        datasets: [
          {
            label: 'Average Marks',
            data: avgScores,
            backgroundColor: '#3b82f6',
          },
          {
            label: 'Highest Marks',
            data: topScores,
            backgroundColor: '#f59e0b',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: textColor },
            grid: { display: false },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
        },
      },
    });
  }

  createDoughnutChart() {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (!ctx) return;

    const classCount: { [key: string]: number } = {};

    this.students.forEach((student) => {
      const className = student.class;
      if (classCount[className]) {
        classCount[className]++;
      } else {
        classCount[className] = 1;
      }
    });

    const labels = Object.keys(classCount);
    const data = Object.values(classCount);

    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f43f5e',
      '#06b6d4',
    ];

    const textColor = this.getThemeColor('--text-color');

    this.doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              padding: 10,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  }
}
