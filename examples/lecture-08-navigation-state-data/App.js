import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack=createNativeStackNavigator();
const API_URL=process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:3001';

function ListScreen({navigation}){
  const[status,setStatus]=useState('loading');const[tasks,setTasks]=useState([]);
  useEffect(()=>{fetch(`${API_URL}/tasks?mode=slow`).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(v=>{setTasks(v);setStatus(v.length?'success':'empty')}).catch(()=>setStatus('error'))},[]);
  return <View style={s.screen}><Text style={s.h1}>Завдання</Text>{status==='loading'&&<ActivityIndicator accessibilityLabel="Завантаження"/>}{status==='error'&&<Text>Не вдалося завантажити дані.</Text>}{status==='empty'&&<Text>Завдань поки немає.</Text>}{status==='success'&&<FlatList data={tasks} keyExtractor={i=>String(i.id)} renderItem={({item})=><Pressable accessibilityRole="button" onPress={()=>navigation.navigate('Details',{taskId:item.id})} style={s.row}><Text style={s.title}>{item.title}</Text><Text style={s.arrow}>›</Text></Pressable>}/>}</View>
}
function DetailsScreen({route,navigation}){
 const[task,setTask]=useState(null); const[error,setError]=useState(''); const{taskId}=route.params;
 useEffect(()=>{fetch(`${API_URL}/tasks/${taskId}`).then(r=>{if(!r.ok)throw new Error();return r.json()}).then(setTask).catch(()=>setError('Завдання не знайдено'))},[taskId]);
 return <View style={s.screen}><Text style={s.meta}>taskId = {taskId}</Text>{error?<Text>{error}</Text>:!task?<ActivityIndicator accessibilityLabel="Завантаження деталей"/>:<><Text style={s.h1}>{task.title}</Text><Text style={s.copy}>Стан: {task.completed?'виконано':'активне'}</Text></>}<Pressable accessibilityRole="button" onPress={()=>navigation.goBack()}><Text style={s.link}>← Назад</Text></Pressable></View>
}
export default function App(){return <SafeAreaProvider><NavigationContainer><Stack.Navigator screenOptions={{headerTitleStyle:{fontWeight:'600'}}}><Stack.Screen name="Tasks" component={ListScreen} options={{title:'Task app'}}/><Stack.Screen name="Details" component={DetailsScreen} options={{title:'Деталі'}}/></Stack.Navigator></NavigationContainer></SafeAreaProvider>}
const s=StyleSheet.create({screen:{flex:1,width:'100%',maxWidth:430,alignSelf:'center',padding:24,backgroundColor:'#fff'},h1:{fontSize:28,fontWeight:'600',marginBottom:18},meta:{color:'#666',marginBottom:6},row:{flexDirection:'row',justifyContent:'space-between',gap:12,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#ddd'},title:{fontSize:16,flex:1},arrow:{fontSize:24,color:'#666'},copy:{fontSize:16,lineHeight:24,marginBottom:28},link:{color:'#1d4ed8',fontSize:16,marginTop:20}});
