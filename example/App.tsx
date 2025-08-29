import {useEffect, useState} from "react";
import {Button, Text, View} from "react-native";
import {AppStorys, UserData} from '@appstorys/appstorys-react-native';

export default function App() {
  const [data, setData] = useState<UserData>();

  // Option A: Initialize on mount
  useEffect(() => {
    appstorysInit();
  }, []);

  const appstorysInit = async () => {
    const data = await AppStorys.initialize(
      "9e1b21a2-350a-4592-918c-2a19a73f249a",
      "4350bf8e-0c9a-46bd-b953-abb65ab21d11",
      "nameisprem",
      "Home Screen",
      // attributes,
    );
    if (data) {
      console.log(data);
      setData(data);
    }
  }

  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text>Testing AppStorys SDK</Text>
      <Button title="Track Screen"/>

      {/*<Banner campaigns={data!.campaigns} user_id={data!.user_id}/>*/}
    </View>
  );
}
