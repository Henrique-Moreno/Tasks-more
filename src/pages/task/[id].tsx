import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { ChangeEvent, FormEvent, useState } from 'react';
import styles from './styles.module.css';
import { db } from '@/services/firebaseConnetion';
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { Textarea } from '@/components/textarea';
import { FaTrash } from 'react-icons/fa';

interface TaskPros {
  item: {
    tarefa: string;
    public: boolean;
    created: string
    user: string;
    taskId: string;
  };
  allComments: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskPros) {

  const { data: session } = useSession();
  const [input, setInput] = useState("");

  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleComment(e: FormEvent) {
    e.preventDefault();

    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId
      });

      const data = {
        id: docRef.id,
        commant: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      };

      setComments((oldItems) => [...oldItems]);
      setInput("");

    } catch (err) {
      console.log(err)
    }
  }

  async function handleDeleteComment(id: string) {
    try {
      const docRef = doc(db, "comments", id);

      await deleteDoc(docRef);

      const deleteComment = comments.filter((item) => item.id !== id);

      setComments(deleteComment)
    }
    catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title>Detalhes da tarefas</title>
      </Head>
      <div className={styles.container}>

        <main className={styles.main}>
          <h1>Tarefa</h1>

          <article className={styles.task}>
            <p>{item.tarefa}</p>
          </article>
        </main>

        <section className={styles.commentsContainer}>
          <h2>Deixe seu comentário</h2>

          <form onSubmit={handleComment}>
            <Textarea
              value={input}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
              placeholder='Digite seu comentário....'
            />
            <button
              disabled={!session?.user}
              className={styles.button}>
              Enviar comentário
            </button>
          </form>
        </section>

        <section className={styles.commentsContainer}>
          <h2>Todos comentários</h2>

          {comments.length === 0 && (
            <span>Nenhum comentário foi encontrado..</span>
          )}

          {comments.map((item) => (
            <article
              key={item.id}
              className={styles.comment}
            >
              <div className={styles.headComment}>
                <label className={styles.commentsLabel}>{item.name}</label>
                {item.user === session?.user?.email && (
                  <button
                    onClick={() => handleDeleteComment(item.id)}
                    className={styles.buttonTrash}
                  >
                    <FaTrash size={18} color="#ea3140" />
                  </button>
                )}

              </div>
              <p>{item.comment}</p>
            </article>
          ))}
        </section>

      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

  const id = params?.id as string;

  const docRef = doc(db, "tarefas", id);

  const q = query(collection(db, "comments"), where("taskId", "==", id));

  const snapshotComments = await getDocs(q);

  let allComments: CommentProps[] = [];

  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId
    });
  });

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      },
    };
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;
  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  }

  return {
    props: {
      item: task,
      allComments: allComments,
    }
  }
}
