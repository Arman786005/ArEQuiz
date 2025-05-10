// Make sure this code is loaded AFTER the Supabase library
const SUPABASE_URL = 'https://kahycodadobjjqriskoc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthaHljb2RhZG9iampxcmlza29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTM4MDgsImV4cCI6MjA2MjQyOTgwOH0.QWPod9Pn1_fA9L9Xr6rmYpdX7BqV1AeUXp8BzatgAwo';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
  } else {
    alert('Sign up successful! Please check your email to confirm your account.');
  }
}

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert(error.message);
  } else {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    loadSubjects();
  }
}

async function signOut() {
  await supabase.auth.signOut();
  document.getElementById('quiz-section').classList.add('hidden');
  document.getElementById('auth-section').classList.remove('hidden');
}

async function loadSubjects() {
  const { data, error } = await supabase.from('subjects').select('*');
  if (error) {
    alert(error.message);
    return;
  }
  const list = document.getElementById('subjects-list');
  list.innerHTML = '';
  data.forEach(subject => {
    const btn = document.createElement('button');
    btn.textContent = subject.name;
    btn.className = 'bg-purple-200 hover:bg-purple-300 text-purple-900 font-semibold px-4 py-2 rounded shadow transition animate__animated animate__fadeInUp';
    btn.onclick = () => loadChapters(subject.id);
    list.appendChild(btn);
  });
}

async function loadChapters(subjectId) {
  const { data, error } = await supabase.from('chapters').select('*').eq('subject_id', subjectId);
  if (error) {
    alert(error.message);
    return;
  }
  const list = document.getElementById('chapters-list');
  list.innerHTML = '';
  data.forEach(chapter => {
    const btn = document.createElement('button');
    btn.textContent = chapter.name;
    btn.className = 'bg-blue-200 hover:bg-blue-300 text-blue-900 font-semibold px-4 py-2 rounded shadow transition animate__animated animate__fadeInUp';
    btn.onclick = () => loadQuestions(chapter.id);
    list.appendChild(btn);
  });
}

async function loadQuestions(chapterId) {
  const { data, error } = await supabase.from('questions').select('*').eq('chapter_id', chapterId);
  if (error) {
    alert(error.message);
    return;
  }
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  data.forEach(q => {
    const div = document.createElement('div');
    div.className = 'bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded shadow animate__animated animate__fadeIn';
    div.innerHTML = `<b class="text-lg">${q.question}</b><br>`;
    const opts = JSON.parse(q.options);
    opts.forEach((opt, i) => {
      div.innerHTML += `<div class="pl-4">${String.fromCharCode(65 + i)}. ${opt}</div>`;
    });
    list.appendChild(div);
  });
}

// Realtime updates for subjects
supabase
  .channel('realtime-subjects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => loadSubjects())
  .subscribe();
