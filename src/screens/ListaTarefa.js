/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { View, Alert, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import Tarefa from '../components/Tarefa';
import AddTarefa from './AddTarefa';

import commonSyles from '../commonStyles';
import todayImage from '../../assets/imgs/today.jpg';

import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

import moment from 'moment';
import 'moment/locale/pt-br';
import commonStyles from '../commonStyles';
//import { State } from 'react-native-gesture-handler/GestureHandler';

const initialState = {
  showDoneTasks: true,
  showAddTarefa: false,
  visibleTasks: [],
  tasks: [],
};

export default class ListaTarefa extends Component {
  state = {
    ...initialState,
  }

  componentDidMount = async () => {
    const stateString = await AsyncStorage.getItem('tasksState');
    const state = JSON.parse(stateString) || initialState;
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(state, this.filterTasks);
  }

  toggleFilter = () => {
    this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks);
  }
  filterTasks = () => {
    let visibleTasks = null;
    if (this.state.showDoneTasks) {
      visibleTasks = [...this.state.tasks];
    } else {
      const pending = tasks => tasks.doneAt === null;
      visibleTasks = this.state.tasks.filter(pending);
    }
    this.setState({ visibleTasks });
    AsyncStorage.setItem('tasksState', JSON.stringify(this.state));
  }
  toggleTask = tarefaId => {
    const tarefa = [...this.state.visibleTasks];
    // eslint-disable-next-line no-shadow
    tarefa.forEach(tarefa => {
      if (tarefa.id === tarefaId) {
        tarefa.doneAt = tarefa.doneAt ? null : new Date();
      }
    });

    this.setState({ tarefa }, this.filterTasks);
  }

  addTask = newTask => {
    if (!newTask.desc || !newTask.desc.trim()) {
      Alert.alert('Dados Inválido', 'Descrição não informada!');
      return;
    }
    const tasks = [...this.state.tasks];
    tasks.push({
      id: Math.random(),
      desc: newTask.desc,
      estimateAt: newTask.date,
      doneAt: null,
    });

    this.setState({ tasks, showAddTarefa: false }, this.filterTasks);
  }

  deleteTask = id => {
    const tasks = this.state.tasks.filter(task => task.id !== id);
    this.setState({ tasks }, this.filterTasks);
  }

  render() {
    const today = moment().locale('pt-br').format('ddd, D [de] MMMM');

    return (
      <View style={styles.container}>
        <AddTarefa isVisible={this.state.showAddTarefa}
          onCancel={() => this.setState({ showAddTarefa: false })}
          onSave={this.addTask} />
        <ImageBackground source={todayImage}
          style={styles.background}>
          <View style={styles.iconBar}>
            <TouchableOpacity onPress={this.toggleFilter}>
              <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'}
                size={20} color={commonSyles.colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.titleBar}>
            <Text style={styles.title}>Tarefas</Text>
            <Text style={styles.subtitle}>{today}</Text>
          </View>
        </ImageBackground>
        <View style={styles.listaTarefa}>
          <FlatList data={this.state.visibleTasks}
            keyExtractor={item => `${item.id}`}
            renderItem={({ item }) => <Tarefa {...item} onToggleTask={this.toggleTask} onDelete={this.deleteTask} />} />
        </View>
        <TouchableOpacity style={styles.addButton}
          onPress={() => this.setState({ showAddTarefa: true })}>
          <Icon name="plus" size={20}
            color={commonSyles.colors.secondary} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 3,
  },
  listaTarefa: {
    flex: 7,
  },
  titleBar: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: commonSyles.fontFamily,
    color: commonSyles.colors.secondary,
    fontSize: 50,
    marginLeft: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: commonSyles.fontFamily,
    color: commonSyles.colors.secondary,
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 30,
  },
  iconBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: commonStyles.colors.today,
    justifyContent: 'center',
    alignItems: 'center',

  },
});
