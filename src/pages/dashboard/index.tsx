import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next/types';
import { getSession } from 'next-auth/react';
import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { Textarea } from '@/components/textarea';
import { db } from '@/services/firebaseConnetion';

import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import Link from 'next/link';

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState
} from 'react';

interface HomeProps {
  user: {
    email: string;
  }
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: HomeProps) {
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);
  const [task, setTask] = useState<TaskProps[]>([]);

  useEffect(() => {
    async function loadTarefas() {

      const tarefasRef = collection(db, "tarefas");
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      )

      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskProps[];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            created: doc.data().created,
            user: doc.data().user,
            public: doc.data().public
          });
        });

        setTask(lista);
      })
    }

    loadTarefas();
  }, [user?.email]);

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked)
  }

  async function handleRegisterTask(e: FormEvent) {
    e.preventDefault();

    if (input === '') return;

    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      });

      setInput("");
      setPublicTask(false);

    } catch (err) {
      console.log(err)
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXTAUTH_URL}/task/${id}`
    );

    alert('Url copiada');
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, "tarefas", id)
    await deleteDoc(docRef)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder='Digite qual sua tarefa...'
                value={input}
                onChange={
                  (e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa publicar?</label>
              </div>

              <button
                className={styles.button}
                type='submit'
              >
                Registrar
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minha tarefas</h1>

          {task.map((item) => (
            <article
              className={styles.task}
              key={item.id}
            >
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICA</label>
                  <button className={styles.shareButton} onClick={ () => handleShare(item.id)}>
                    <FiShare2
                      size={22}
                      colore="#3183ff"
                    />
                  </button>
                </div>
              )}

              <div className={styles.taskContent}>
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}
                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                  <FaTrash
                    size={24}
                    color='#ea3140'
                  />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      user: {
        email: session?.user?.email
      }
    },
  }
};
