import { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import { useAuth } from './useAuth';

type FirebaseQuestions = Record<string, {
  author:{
    name: string;
    avatar: string;
  }
  content: string;
  isAnswer:boolean;
  isHighLighted: boolean;
  likes: Record<string, {
    authorId: string;
  }>
}>

type QuestionType = {
  id:string;
  author:{
    name: string;
    avatar: string;
  }
  content: string;
  isAnswer:boolean;
  isHighLighted: boolean;
  likeCount: number;
  likeId: string | undefined;
 
}

export function useRoom(roomId:string){
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [title, setTitle] = useState('')

  useEffect(()=>{
    const roomRef= database.ref(`rooms/${roomId}`);

    roomRef.on('value', room =>{
      const databaseRoom = room.val();
      const firebaseQuestion:FirebaseQuestions =  databaseRoom.questions  ?? {};

      const parserdQuestions = Object.entries(firebaseQuestion).map(([key,value])=>{
       return {
         id: key,
         content: value.content,
         author: value.author,
         isHighLighted: value.isHighLighted,
         isAnswer: value.isAnswer,
         likeCount: Object.values(value.likes ?? {}).length,
         likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
       }
     })

     setTitle(databaseRoom.title)
     setQuestions(parserdQuestions)
    })

    return () => {
      roomRef.off('value');
    }
  }, [roomId, user?.id])

  return { questions, title}
}