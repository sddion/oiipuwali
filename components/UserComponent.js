import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';
import { decode } from 'base64-arraybuffer';
import { LinearGradient } from 'expo-linear-gradient';

const UserComponent = ({ route }) => {
  const { userData } = route.params;
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [profileImage, setProfileImage] = useState(userData?.profile_image || null);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to change your profile picture.');
      }
    })();
  }, []);

  useEffect(() => {
    const checkStorageBucket = async () => {
      try {
        const { data, error } = await supabase.storage.from('profile-images').list();
        if (error) throw error;
        console.log('Successfully accessed storage bucket:', data);
      } catch (error) {
        console.error('Error accessing storage bucket:', error);
      }
    };
    checkStorageBucket();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth error:', error);
      } else if (user) {
        console.log('Authenticated user:', user.id);
      } else {
        console.log('No authenticated user');
      }
    };

    const checkStorageAccess = async () => {
      try {
        const { error } = await supabase.storage
          .from('profile-images')
          .list();
        if (error) throw error;
        console.log('Successfully accessed storage bucket');
      } catch (error) {
        console.error('Error accessing storage bucket:', error);
      }
    };

    checkAuth();
    checkStorageAccess();
  }, []);

  const handleSave = async (field) => {
    try {
      const updateData = { [field]: field === 'name' ? name : field === 'email' ? email : phone };
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userData.id);

      if (error) throw error;
      setEditingField(null);
   //   Alert.alert('Success', `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (error) {
     console.error('Error updating user data:', error);
   //   Alert.alert('Error', `Failed to update ${field}`);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (result.canceled) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const fileName = `${user.id}/${Date.now()}-profile-image.jpg`;
      console.log('Attempting to upload file:', fileName);

      const base64FileData = result.assets[0].base64;
      if (!base64FileData) {
        throw new Error('No base64 data available from the selected image');
      }

      const arrayBuffer = decode(base64FileData);

      if (arrayBuffer.byteLength > 5242880) {
        Alert.alert('Error', 'Image size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }

      console.log('File size:', arrayBuffer.byteLength, 'bytes');

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }

      console.log('File uploaded successfully. Getting public URL...');
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      if (urlError) {
        console.error('Error getting public URL:', urlError);
        throw urlError;
      }

      console.log('Public URL obtained:', publicUrl);
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }

      setProfileImage(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to update profile picture. ';
      errorMessage += 'Error details: ' + (error.message || 'Unknown error occurred.');
      console.error(errorMessage);
    }
  };

  const renderField = (label, value, field, icon) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <MaterialIcons name={icon} size={24} color="#FF6347" style={styles.fieldIcon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.inputContainer}>
        {editingField === field ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => {
              if (field === 'name') setName(text);
              else if (field === 'email') setEmail(text);
              else if (field === 'phone') setPhone(text);
            }}
            placeholder={`Enter your ${field}`}
            placeholderTextColor="#666"
            keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (editingField === field) {
              handleSave(field);
            } else {
              setEditingField(field);
            }
          }}
        >
          <LinearGradient
            colors={editingField === field ? ['#4CAF50', '#45a049'] : ['#FF6347', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.editButtonGradient}
          >
            <Ionicons name={editingField === field ? 'checkmark-outline' : 'create-outline'} size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF6347', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : { uri: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.formWrapper}>
        {renderField('Name', name, 'name', 'person')}
        {renderField('Email', email, 'email', 'email')}
        {renderField('Phone', phone, 'phone', 'phone')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  formWrapper: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  fieldValue: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserComponent;