import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable,
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";

const STORAGE_KEY = "notre-mariage-isaora-david-v1";
const COLORS = {
  rose: "#C98FA4", rosePale: "#F8EAF0", blue: "#A9C9E8",
  bluePale: "#EAF3FB", ivory: "#FFFCF7", eucalyptus: "#9BAD9A",
  ink: "#493D43", muted: "#847780", line: "#E9DDE2", white: "#FFFFFF",
  gold: "#C4A56B", danger: "#B64D62"
};
const initialData = {
  weddingDate: "2029-07-07",
  tasks: [
    {id:"t1", title:"Définir le budget global", due:"", done:false},
    {id:"t2", title:"Confirmer le lieu de réception", due:"", done:false},
    {id:"t3", title:"Comparer les traiteurs", due:"", done:false},
    {id:"t4", title:"Préparer la liste des invités", due:"", done:false}
  ],
  expenses: [],
  guests: [],
  vendors: []
};
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const money = n => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(Number(n)||0);

export default function App() {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Accueil");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setData({...initialData, ...JSON.parse(raw)});
      } catch (e) {
        Alert.alert("Sauvegarde", "Impossible de lire les données locales. Tu peux importer une sauvegarde.");
      } finally { setReady(true); }
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() =>
      Alert.alert("Sauvegarde", "L'enregistrement local a échoué.")
    );
  }, [data, ready]);

  const update = (key, value) => setData(old => ({...old, [key]: value}));
  const addItem = (key, item) => { update(key, [{id:uid(), ...item}, ...data[key]]); setModal(null); setForm({}); };
  const deleteItem = (key, id) => Alert.alert("Supprimer ?", "Cette action ne peut pas être annulée sans sauvegarde.", [
    {text:"Annuler",style:"cancel"}, {text:"Supprimer",style:"destructive",onPress:()=>update(key,data[key].filter(x=>x.id!==id))}
  ]);
  const totals = useMemo(() => ({
    budget: data.expenses.reduce((s,x)=>s+(Number(x.amount)||0),0),
    paid: data.expenses.filter(x=>x.paid).reduce((s,x)=>s+(Number(x.amount)||0),0),
    tasksDone: data.tasks.filter(x=>x.done).length
  }), [data]);
  const openForm = (type) => { setForm({}); setModal(type); };

  async function exportBackup() {
    try {
      const uri = FileSystem.documentDirectory + "sauvegarde-notre-mariage.json";
      await FileSystem.writeAsStringAsync(uri, JSON.stringify({...data, exportedAt:new Date().toISOString()}, null, 2));
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, {mimeType:"application/json",dialogTitle:"Sauvegarder Notre Mariage"});
      else Alert.alert("Sauvegarde créée", uri);
    } catch(e) { Alert.alert("Erreur", "Impossible de créer la sauvegarde. Réessaie."); }
  }
  async function importBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({type:["application/json","text/json"],copyToCacheDirectory:true});
      if (result.canceled) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.expenses) || !Array.isArray(parsed.guests) || !Array.isArray(parsed.vendors)) {
        throw new Error("format");
      }
      Alert.alert("Restaurer la sauvegarde ?", "Les données actuelles seront remplacées par celles du fichier.", [
        {text:"Annuler",style:"cancel"}, {text:"Restaurer",onPress:()=>setData({...initialData,...parsed})}
      ]);
    } catch(e) { Alert.alert("Import impossible", "Choisis un fichier JSON exporté depuis cette application."); }
  }

  const card = (children, style={}) => <View style={[styles.card,style]}>{children}</View>;
  const heading = (title, subtitle) => <View style={{marginBottom:14}}><Text style={styles.h1}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
  const button = (label, onPress, kind="primary") => <Pressable onPress={onPress} style={[styles.button, kind==="secondary"&&styles.buttonSecondary, kind==="soft"&&styles.buttonSoft]}><Text style={[styles.buttonText,kind!=="primary"&&styles.buttonTextAlt]}>{label}</Text></Pressable>;
  const rowItem = (title, subtitle, right, onPress) => <Pressable onPress={onPress} style={styles.itemRow}><View style={{flex:1}}><Text style={styles.itemTitle}>{title}</Text>{subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text>:null}</View>{right}</Pressable>;

  function renderHome() {
    return <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>NOTRE HISTOIRE, NOTRE JOUR</Text>
        <Text style={styles.heroTitle}>Isaora <Text style={{color:COLORS.rose}}> & </Text> David</Text>
        <Text style={styles.heroDate}>7 juillet 2029</Text>
        <View style={styles.flowerLine}><Text>✿  ♡  ❀  ♡  ✿</Text></View>
      </View>
      {card(<>
        <Text style={styles.sectionTitle}>Notre mariage approche, doucement…</Text>
        <Text style={styles.subtitle}>Un petit pas après l'autre, tout prend forme.</Text>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNumber}>{data.tasks.length}</Text><Text style={styles.statLabel}>Tâches</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{totals.tasksDone}</Text><Text style={styles.statLabel}>Terminées</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{data.guests.length}</Text><Text style={styles.statLabel}>Invités</Text></View>
        </View>
      </>)}
      {card(<>
        <Text style={styles.sectionTitle}>À faire ensuite</Text>
        {data.tasks.filter(t=>!t.done).slice(0,3).map(t=><View key={t.id} style={styles.miniTask}><Text style={styles.bullet}>♡</Text><Text style={styles.itemTitle}>{t.title}</Text></View>)}
        {data.tasks.filter(t=>!t.done).length===0 ? <Text style={styles.subtitle}>Toutes les tâches sont terminées. Bravo !</Text>:null}
        {button("Voir le planning",()=>setTab("Planning"),"soft")}
      </>)}
      {card(<>
        <Text style={styles.sectionTitle}>Le budget prévu</Text>
        <Text style={styles.moneyLarge}>{money(totals.budget)}</Text>
        <Text style={styles.subtitle}>Dépenses enregistrées · {money(totals.paid)} déjà payés</Text>
        {button("Gérer le budget",()=>setTab("Budget"),"soft")}
      </>)}
      {card(<>
        <Text style={styles.sectionTitle}>Sauvegarde de nos préparatifs</Text>
        <Text style={styles.subtitle}>Exporte régulièrement une copie pour garder tes informations en sécurité.</Text>
        <View style={styles.buttonRow}>{button("Exporter",exportBackup)}{button("Importer",importBackup,"secondary")}</View>
      </>)}
    </ScrollView>;
  }

  function renderList() {
    const configs = {
      "Planning": {key:"tasks", title:"Notre planning", sub:"Chaque petit détail compte.", add:"Ajouter une tâche", fields:[["title","Tâche"],["due","Échéance (ex. 2028-10-01)"]]},
      "Budget": {key:"expenses", title:"Notre budget", sub:"Garder une vision claire des dépenses.", add:"Ajouter une dépense", fields:[["title","Dépense / prestation"],["amount","Montant en euros"]]},
      "Invités": {key:"guests", title:"Nos invités", sub:"La liste de ceux qui partageront cette journée.", add:"Ajouter un invité", fields:[["name","Nom et prénom"],["status","Réponse (À confirmer / Oui / Non)"]]},
      "Prestataires": {key:"vendors", title:"Nos prestataires", sub:"Tous les contacts utiles au même endroit.", add:"Ajouter un prestataire", fields:[["name","Nom du prestataire"],["category","Catégorie (traiteur, fleuriste…)"],["contact","Téléphone / e-mail"],["quote","Devis en euros"]]}
    };
    const cfg = configs[tab];
    if (!cfg) return null;
    const items = data[cfg.key];
    const filtered = items.filter(x=>JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
    return <ScrollView contentContainerStyle={styles.page}>
      {heading(cfg.title,cfg.sub)}
      {tab==="Budget" ? card(<><Text style={styles.subtitle}>Total enregistré</Text><Text style={styles.moneyLarge}>{money(totals.budget)}</Text><Text style={styles.subtitle}>Payé : {money(totals.paid)} · Reste à payer : {money(totals.budget-totals.paid)}</Text></>):null}
      <TextInput value={search} onChangeText={setSearch} placeholder="Rechercher…" placeholderTextColor={COLORS.muted} style={styles.search}/>
      {button("+ "+cfg.add,()=>openForm(tab))}
      {filtered.length===0 ? card(<Text style={styles.subtitle}>Rien ici pour le moment. Tu peux ajouter le premier élément.</Text>):null}
      {filtered.map(item => {
        if (tab==="Planning") return card(<View key={item.id}>
          <View style={styles.itemRow}>
            <Pressable onPress={()=>update("tasks",data.tasks.map(t=>t.id===item.id?{...t,done:!t.done}:t))} style={[styles.check,item.done&&styles.checkDone]}><Text style={{color:item.done?COLORS.white:COLORS.rose}}>{item.done?"✓":""}</Text></Pressable>
            <View style={{flex:1}}><Text style={[styles.itemTitle,item.done&&styles.doneText]}>{item.title}</Text>{item.due?<Text style={styles.itemSubtitle}>Échéance : {item.due}</Text>:null}</View>
            <Pressable onPress={()=>deleteItem("tasks",item.id)}><Text style={styles.deleteText}>Suppr.</Text></Pressable>
          </View>
        </View>,{padding:12});
        if (tab==="Budget") return card(<View key={item.id}>
          <View style={styles.itemRow}><View style={{flex:1}}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemSubtitle}>{item.paid?"Payé":"À payer"}</Text></View><Text style={styles.amount}>{money(item.amount)}</Text></View>
          <View style={styles.buttonRow}>{button(item.paid?"Marquer à payer":"Marquer payé",()=>update("expenses",data.expenses.map(x=>x.id===item.id?{...x,paid:!x.paid}:x)),"soft")}{button("Supprimer",()=>deleteItem("expenses",item.id),"secondary")}</View>
        </View>,{padding:12});
        if (tab==="Invités") return card(<View key={item.id}><View style={styles.itemRow}><View style={{flex:1}}><Text style={styles.itemTitle}>{item.name}</Text><Text style={styles.itemSubtitle}>{item.status||"À confirmer"}</Text></View><Pressable onPress={()=>deleteItem("guests",item.id)}><Text style={styles.deleteText}>Suppr.</Text></Pressable></View></View>,{padding:12});
        return card(<View key={item.id}><View style={styles.itemRow}><View style={{flex:1}}><Text style={styles.itemTitle}>{item.name}</Text><Text style={styles.itemSubtitle}>{item.category||"Prestataire"} · {item.contact||"Contact à ajouter"}</Text>{item.quote?<Text style={styles.itemSubtitle}>Devis : {money(item.quote)}</Text>:null}</View><Pressable onPress={()=>deleteItem("vendors",item.id)}><Text style={styles.deleteText}>Suppr.</Text></Pressable></View></View>,{padding:12});
      })}
    </ScrollView>;
  }

  function submitForm() {
    if (modal==="Planning") {
      if (!form.title?.trim()) return Alert.alert("Information manquante","Ajoute le nom de la tâche.");
      addItem("tasks",{title:form.title.trim(),due:form.due||"",done:false});
    } else if (modal==="Budget") {
      if (!form.title?.trim() || !form.amount || isNaN(Number(form.amount))) return Alert.alert("Informations manquantes","Ajoute un nom et un montant valide.");
      addItem("expenses",{title:form.title.trim(),amount:Number(form.amount),paid:false});
    } else if (modal==="Invités") {
      if (!form.name?.trim()) return Alert.alert("Information manquante","Ajoute le nom de l'invité.");
      addItem("guests",{name:form.name.trim(),status:form.status||"À confirmer"});
    } else if (modal==="Prestataires") {
      if (!form.name?.trim()) return Alert.alert("Information manquante","Ajoute le nom du prestataire.");
      addItem("vendors",{name:form.name.trim(),category:form.category||"",contact:form.contact||"",quote:form.quote||""});
    }
  }
  function renderModal() {
    const cfg = {
      "Planning": [["title","Nom de la tâche"],["due","Échéance (AAAA-MM-JJ)"]],
      "Budget": [["title","Dépense / prestation"],["amount","Montant en euros"]],
      "Invités": [["name","Nom et prénom"],["status","Réponse (À confirmer, Oui ou Non)"]],
      "Prestataires": [["name","Nom du prestataire"],["category","Catégorie"],["contact","Téléphone ou e-mail"],["quote","Montant du devis en euros"]]
    }[modal];
    if (!cfg) return null;
    return <Modal transparent animationType="slide" visible={!!modal} onRequestClose={()=>setModal(null)}>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.h1}>{modal==="Planning"?"Nouvelle tâche":modal==="Budget"?"Nouvelle dépense":modal==="Invités"?"Nouvel invité":"Nouveau prestataire"}</Text>
          {cfg.map(([key,placeholder])=><TextInput key={key} value={form[key]||""} onChangeText={v=>setForm(old=>({...old,[key]:v}))} placeholder={placeholder} placeholderTextColor={COLORS.muted} keyboardType={["amount","quote"].includes(key)?"decimal-pad":"default"} style={styles.input}/>)}
          <View style={styles.buttonRow}>{button("Enregistrer",submitForm)}{button("Annuler",()=>setModal(null),"secondary")}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>;
  }

  if (!ready) return <SafeAreaView style={styles.safe}><Text style={styles.subtitle}>Ouverture de votre carnet de mariage…</Text></SafeAreaView>;
  const tabs = ["Accueil","Planning","Budget","Invités","Prestataires"];
  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.ivory}/>
    <View style={styles.topbar}><Text style={styles.brand}>♡ Notre Mariage</Text><Text style={styles.brandSub}>ISAORA & DAVID</Text></View>
    <View style={styles.content}>{tab==="Accueil"?renderHome():renderList()}</View>
    <View style={styles.tabbar}>{tabs.map(t=><Pressable key={t} onPress={()=>{setTab(t);setSearch("");}} style={[styles.tab,tab===t&&styles.tabActive]}><Text style={[styles.tabText,tab===t&&styles.tabTextActive]}>{({"Accueil":"⌂","Planning":"♡","Budget":"€","Invités":"♧","Prestataires":"✿"})[t]}</Text><Text style={[styles.tabLabel,tab===t&&styles.tabTextActive]}>{t}</Text></Pressable>)}</View>
    {renderModal()}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:COLORS.ivory},
  topbar:{paddingTop:8,paddingBottom:12,alignItems:"center",borderBottomWidth:1,borderColor:COLORS.line,backgroundColor:COLORS.ivory},
  brand:{fontSize:20,fontWeight:"700",color:COLORS.ink,letterSpacing:.3},
  brandSub:{fontSize:10,letterSpacing:3,color:COLORS.rose,marginTop:3},
  content:{flex:1},
  page:{padding:16,paddingBottom:28,gap:14},
  hero:{backgroundColor:COLORS.rosePale,borderRadius:24,padding:24,alignItems:"center",borderWidth:1,borderColor:"#F0D8E2"},
  eyebrow:{fontSize:10,letterSpacing:2,color:COLORS.muted},
  heroTitle:{fontSize:31,fontWeight:"700",color:COLORS.ink,marginTop:10},
  heroDate:{fontSize:17,color:COLORS.muted,marginTop:7},
  flowerLine:{marginTop:12,color:COLORS.rose,fontSize:20},
  card:{backgroundColor:COLORS.white,borderRadius:18,padding:16,borderWidth:1,borderColor:COLORS.line,gap:10},
  sectionTitle:{fontSize:17,fontWeight:"700",color:COLORS.ink},
  subtitle:{fontSize:13,color:COLORS.muted,lineHeight:19},
  stats:{flexDirection:"row",justifyContent:"space-around",marginTop:10,paddingTop:14,borderTopWidth:1,borderColor:COLORS.line},
  stat:{alignItems:"center",gap:4},
  statNumber:{fontSize:23,fontWeight:"700",color:COLORS.rose},
  statLabel:{fontSize:11,color:COLORS.muted},
  miniTask:{flexDirection:"row",gap:10,alignItems:"center",paddingVertical:5},
  bullet:{color:COLORS.rose,fontSize:18},
  h1:{fontSize:25,fontWeight:"700",color:COLORS.ink},
  button:{backgroundColor:COLORS.rose,borderRadius:12,paddingVertical:12,paddingHorizontal:14,alignItems:"center",justifyContent:"center",flex:1,minHeight:42},
  buttonSecondary:{backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.line},
  buttonSoft:{backgroundColor:COLORS.bluePale},
  buttonText:{color:COLORS.white,fontWeight:"700",fontSize:13},
  buttonTextAlt:{color:COLORS.ink},
  buttonRow:{flexDirection:"row",gap:8,marginTop:5},
  moneyLarge:{fontSize:27,fontWeight:"700",color:COLORS.rose},
  search:{backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.line,borderRadius:12,padding:12,color:COLORS.ink},
  itemRow:{flexDirection:"row",alignItems:"center",gap:10,paddingVertical:5},
  itemTitle:{fontSize:14,fontWeight:"600",color:COLORS.ink,flexShrink:1},
  itemSubtitle:{fontSize:12,color:COLORS.muted,marginTop:4},
  amount:{fontSize:15,fontWeight:"700",color:COLORS.rose},
  check:{width:26,height:26,borderRadius:13,borderWidth:1.5,borderColor:COLORS.rose,alignItems:"center",justifyContent:"center"},
  checkDone:{backgroundColor:COLORS.eucalyptus,borderColor:COLORS.eucalyptus},
  doneText:{textDecorationLine:"line-through",color:COLORS.muted},
  deleteText:{fontSize:11,color:COLORS.danger,fontWeight:"600",padding:6},
  tabbar:{flexDirection:"row",paddingTop:8,paddingBottom:Platform.OS==="ios"?8:10,backgroundColor:COLORS.white,borderTopWidth:1,borderColor:COLORS.line},
  tab:{flex:1,alignItems:"center",gap:3,paddingVertical:4,borderRadius:10,marginHorizontal:2},
  tabActive:{backgroundColor:COLORS.rosePale},
  tabText:{fontSize:19,color:COLORS.muted},
  tabLabel:{fontSize:9,color:COLORS.muted},
  tabTextActive:{color:COLORS.rose,fontWeight:"700"},
  modalBackdrop:{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(55,40,48,.35)"},
  modalCard:{backgroundColor:COLORS.ivory,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,gap:12,paddingBottom:30},
  input:{backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.line,borderRadius:12,padding:13,color:COLORS.ink,fontSize:14}
});
