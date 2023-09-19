import { GetStaticProps } from 'next';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import Image from 'next/image';
import { db } from '@/services/firebaseConnetion';
import {
  collection,
  getDocs,
} from 'firebase/firestore';
import heroLog from '@/assets/hero.png';

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      <main className={styles.container}>
        <section className={styles.containerMain}>
          <div className={styles.logoContext}>
            <Image
              className={styles.hero}
              src={heroLog}
              alt='Logo Tarefas+'
              priority
            />
          </div>
          <h1
            className={styles.title}
          >
            Sistema feito para você organizar seus
            <br /> seus estudos e tarefas.
          </h1>

          <div className={styles.infoContainer}>
            <section className={styles.box}>
              <span>+ {posts} posts</span>
            </section>

            <section className={styles.box}>
              <span>+ {comments} comentário</span>
            </section>

          </div>
        </section>
        
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    },
    revalidate: 60
  }
}
