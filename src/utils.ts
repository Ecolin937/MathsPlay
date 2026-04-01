import { Difficulty, Operation, Question, Grade } from './types';

export const generateQuestion = (difficulty: Difficulty, operation: Operation, grade: Grade = '6eme'): Question => {
  let min = 1;
  let max = 10;

  if (difficulty === 'medium') {
    max = 50;
  } else if (difficulty === 'hard') {
    max = 100;
  }

  let op = operation;
  if (operation === 'mixed') {
    const gradeOps: Record<Grade, Operation[]> = {
      '6eme': ['addition', 'subtraction', 'multiplication', 'division', 'decimals', 'fractions', 'percentages', 'proportionality'],
      '5eme': ['addition', 'subtraction', 'multiplication', 'division', 'decimals', 'fractions', 'relatives', 'percentages', 'proportionality'],
      '4eme': ['addition', 'subtraction', 'multiplication', 'division', 'decimals', 'fractions', 'relatives', 'powers', 'equations', 'percentages', 'proportionality']
    };
    const ops = gradeOps[grade];
    op = ops[Math.floor(Math.random() * ops.length)];
  }

  let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
  let num2 = Math.floor(Math.random() * (max - min + 1)) + min;
  let answer: string | number = 0;
  let text = '';

  switch (op) {
    case 'addition':
      answer = num1 + num2;
      text = `${num1} + ${num2}`;
      break;
    case 'subtraction':
      if (grade === '6eme') {
        if (num1 < num2) [num1, num2] = [num2, num1];
      }
      answer = num1 - num2;
      text = `${num1} - ${num2}`;
      break;
    case 'multiplication':
      if (difficulty === 'easy') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      }
      answer = num1 * num2;
      text = `${num1} × ${num2}`;
      break;
    case 'division':
      answer = num1;
      num1 = answer * num2;
      text = `${num1} ÷ ${num2}`;
      break;
    case 'decimals':
      const d1 = (Math.random() * max).toFixed(1);
      const d2 = (Math.random() * max).toFixed(1);
      const decOp = Math.random() > 0.5 ? '+' : '-';
      if (decOp === '+') {
        answer = parseFloat((parseFloat(d1) + parseFloat(d2)).toFixed(1));
        text = `${d1} + ${d2}`;
      } else {
        let val1 = parseFloat(d1);
        let val2 = parseFloat(d2);
        if (val1 < val2) [val1, val2] = [val2, val1];
        answer = parseFloat((val1 - val2).toFixed(1));
        text = `${val1.toFixed(1)} - ${val2.toFixed(1)}`;
      }
      break;
    case 'fractions':
      const den = [2, 3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 7)];
      const n1 = Math.floor(Math.random() * den) + 1;
      const n2 = Math.floor(Math.random() * den) + 1;
      const fracOp = grade === '4eme' ? (Math.random() > 0.5 ? '×' : '+') : '+';
      
      if (fracOp === '+') {
        answer = `${n1 + n2}/${den}`;
        text = `${n1}/${den} + ${n2}/${den}`;
      } else {
        answer = `${n1 * n2}/${den * den}`;
        text = `${n1}/${den} × ${n2}/${den}`;
      }
      break;
    case 'relatives':
      const r1 = Math.floor(Math.random() * 21) - 10;
      const r2 = Math.floor(Math.random() * 21) - 10;
      const relOp = grade === '4eme' ? (Math.random() > 0.5 ? '×' : '+') : '+';
      if (relOp === '+') {
        answer = r1 + r2;
        text = `(${r1}) + (${r2})`;
      } else {
        answer = r1 * r2;
        text = `(${r1}) × (${r2})`;
      }
      break;
    case 'powers':
      const base = Math.floor(Math.random() * 10) + 1;
      const exp = Math.floor(Math.random() * 4);
      answer = Math.pow(base, exp);
      text = `${base} puissance ${exp}`;
      break;
    case 'equations':
      const x = Math.floor(Math.random() * 20);
      const a = Math.floor(Math.random() * 20);
      const eqType = Math.random() > 0.5 ? '+' : '-';
      if (eqType === '+') {
        const b = x + a;
        text = `x + ${a} = ${b}. x = ?`;
      } else {
        const b = x - a;
        text = `x - ${a} = ${b}. x = ?`;
      }
      answer = x;
      break;
    case 'percentages':
      const p = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
      const total = [40, 80, 100, 200, 500][Math.floor(Math.random() * 5)];
      answer = (p * total) / 100;
      text = `${p}% de ${total}`;
      break;
    case 'proportionality':
      const scenarios = [
        { item: 'pommes', unit: 'kg', price: 2 },
        { item: 'stylos', unit: 'pce', price: 1.5 },
        { item: 'bonbons', unit: 'g', price: 0.05 },
        { item: 'essence', unit: 'L', price: 1.8 },
      ];
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const q1 = Math.floor(Math.random() * 5) + 2;
      const p1 = parseFloat((q1 * scenario.price).toFixed(2));
      const q2 = q1 + Math.floor(Math.random() * 5) + 1;
      answer = parseFloat((q2 * scenario.price).toFixed(2));
      text = `Si ${q1} ${scenario.item} coûtent ${p1}€, combien coûtent ${q2} ${scenario.item} ?`;
      break;
  }

  const options = generateOptions(answer);

  return {
    id: Math.random().toString(36).substr(2, 9),
    text,
    answer,
    options,
  };
};

const generateOptions = (answer: string | number): (string | number)[] => {
  const options = new Set<string | number>();
  options.add(answer);

  while (options.size < 4) {
    let option: string | number;
    if (typeof answer === 'number') {
      const offset = Math.floor(Math.random() * 10) - 5;
      option = answer + (offset === 0 ? 1 : offset);
      if (option < -100) option = 0;
    } else {
      // Fraction handling
      const parts = answer.split('/');
      const n = parseInt(parts[0]);
      const d = parseInt(parts[1]);
      option = `${n + Math.floor(Math.random() * 5) - 2}/${d}`;
    }
    
    if (option !== answer) {
      options.add(option);
    }
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
};
