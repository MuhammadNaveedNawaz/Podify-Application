import AudioForm from '@components/form/AudioForm';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {mapRange} from '@utils/math';
import {FC, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useQueryClient} from 'react-query';
import {useDispatch} from 'react-redux';
import {ProfileNavigatorStackParamList} from 'src/@types/navigation';
import catchAsyncError from 'src/api/catchError';
import {getClient} from 'src/api/client';
import {upldateNotification} from 'src/store/notification';

type Props = NativeStackScreenProps<
  ProfileNavigatorStackParamList,
  'UpdateAudio'
>;

const UpdateAudio: FC<Props> = props => {
  const {audio} = props.route.params;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const {navigate} = useNavigation<NavigationProp<ProfileNavigatorStackParamList>>()

  const handleUpdate = async (formdata: FormData) => {
    setBusy(true);
    try {
      const client = await getClient({'Content-Type': 'multipart/form-data;'});

      const {data} = await client.patch('/audio/' + audio.id, formdata, {
        onUploadProgress(progressEvent) {
          const uploaded = mapRange({
            inputMin: 0,
            inputMax: progressEvent.total || 0,
            outputMin: 0,
            outputMax: 100,
            inputValue: progressEvent.loaded,
          });

          if (uploaded >= 100) {
            setBusy(false);
          }

          setUploadProgress(Math.floor(uploaded));
        },
      });

      queryClient.invalidateQueries({queryKey: ['upload-by-profile']});
      navigate('Profile')
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      dispatch(upldateNotification({message: errorMessage, type: 'error'}));
    }
    setBusy(false);
  };
  return (
    <AudioForm
      initialValues={{
        title: audio.title,
        category: audio.category,
        about: audio.about,
      }}
      onSubmit={handleUpdate}
      busy={busy}
      progress={uploadProgress}
    />
  );
};
const styles = StyleSheet.create({
  container: {},
});
export default UpdateAudio;
