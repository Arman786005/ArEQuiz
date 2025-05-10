const SUPABASE_URL = 'https://kahycodadobjjqriskoc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthaHljb2RhZG9iampxcmlza29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTM4MDgsImV4cCI6MjA2MjQyOTgwOH0.QWPod9Pn1_fA9L9Xr6rmYpdX7BqV1AeUXp8BzatgAwo';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert('Check your email for confirmation!');
}

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    loadSubjects();
  }
}

async function signOut() {
  await supabase.auth.signOut();
  location.reload();
}

async function loadSubjects() {
  const { data, error } = await supabase.from('subjects').select('*');
  if (error) return alert(error.message);
  const list = document.getElementById('subjects-list');
  list.innerHTML = '';
  data.forEach(subject => {
    const btn = document.createElement('button');
    btn.textContent = subject.name;
    btn.className = 'bg-blue-200 p-2 m-1 rounded';
    btn.onclick = () => loadChapters(subject.id);
    list.appendChild(btn);
  });
}

async function loadChapters(subjectId) {
  const { data, error } = await supabase.from('chapters').select('*').eq('subject_id', subjectId);
  if (error) return alert(error.message);
  const list = document.getElementById('chapters-list');
  list.innerHTML = '';
  data.forEach(chapter => {
    const btn = document.createElement('button');
    btn.textContent = chapter.name;
    btn.className = 'bg-green-200 p-2 m-1 rounded';
    btn.onclick = () => loadQuestions(chapter.id);
    list.appendChild(btn);
  });
}

async function loadQuestions(chapterId) {
  const { data, error } = await supabase.from('questions').select('*').eq('chapter_id', chapterId);
  if (error) return alert(error.message);
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  data.forEach(q => {
    const div = document.createElement('div');
    div.className = 'bg-white p-2 m-2 rounded shadow';
    div.innerHTML = `<b>${q.question}</b><br>`;
    const opts = JSON.parse(q.options);
    opts.forEach((opt, i) => {
      div.innerHTML += `<div>${String.fromCharCode(65+i)}. ${opt}</div>`;
    });
    list.appendChild(div);
  });
}

// Listen for real-time changes
supabase
  .channel('realtime-subjects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => loadSubjects())
  .subscribe();
