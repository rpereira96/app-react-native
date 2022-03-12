import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { 
    Container ,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UsergGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transaction,
    Title,
    TransactionsList,
    LogoutButton, 
    LoadContainer
} from './styles';

import AsyncStorage from '@react-native-async-storage/async-storage';

import HighlightCard from '../../components/HighlightCard';
import TransactionCard, {TransactionCardProps} from '../../components/TransactionCard';
import theme from '../../global/styles/theme';

export interface DataListProps extends TransactionCardProps {
    id: string;
    name: string;
}

interface HighlightProps{
    amount: string;
    lastTransaction: string;
}

interface HighlightData{
    entries: HighlightProps;
    expensives: HighlightProps;
    total: HighlightProps;
}

export function Dashboard(){
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);


    function getLastTransactionDate(
        collection: DataListProps[],
        type: 'positive' | 'negative'){

        const lastTransaction = new Date(
        Math.max.apply(Math,collection
        .filter(transactions => transactions.type === type)
        .map(transactions => new Date(transactions.date).getTime())));

        return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BB', {month: 'long'})}`
    }


    async function loadTransactions(){
        const dataKey = '@gofinance:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        const transactionsFormated: DataListProps[] = transactions
        .map((item: DataListProps) => {
            
            if(item.type === 'positive'){
                entriesTotal += Number(item.amount);
            }else{
                expensiveTotal += Number(item.amount);
            }

            const amount = Number(item.amount).toLocaleString('pt-BR',  {
                style: 'currency',
                currency: 'BRL'
            });

            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }).format(new Date(item.date));

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date,
            }
        });

        setTransactions(transactionsFormated); 

        const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive');
        const lastTransactionsExpensives = getLastTransactionDate(transactions,'negative');
        const totalInterval =  `01 a ${lastTransactionsExpensives}`;

        const total = entriesTotal - expensiveTotal; 

        setHighlightData({
            entries:{
                amount: entriesTotal.toLocaleString('pt-BR',{
                    style: 'currency',
                    currency: 'brl'
                }),
                lastTransaction: `Última entrada dia ${lastTransactionsEntries}`, 
            },
            expensives:{
                amount: expensiveTotal.toLocaleString('pt-BR',{
                    style: 'currency',
                    currency: 'brl'
                }),
                lastTransaction: `Última saída dia ${lastTransactionsExpensives}`
            },
            total:{
                amount: total.toLocaleString('pt-BR',{
                    style: 'currency',
                    currency: 'brl'
                }),
                lastTransaction: totalInterval
            },
        });

        setIsLoading(false);
    }
    

    useEffect(()=>{
        loadTransactions();
    },[]);

    useFocusEffect(useCallback(() => {
        loadTransactions();
    },[]));

    return(
        <Container>
        {
            isLoading ? 
            <LoadContainer>
                <ActivityIndicator 
                    color={theme.colors.primary}
                    size="large"
                /> 
            </LoadContainer>
                :    
                    <>
                        <Header>
                            <UserWrapper>
                                <UserInfo>
                                    <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/82479695?v='}}/>
                                    <User>
                                        <UsergGreeting>Olá,</UsergGreeting>
                                        <UserName>Pereira</UserName>
                                    </User>
                                </UserInfo>

                                <LogoutButton onPress={() => {}}>
                                    <Icon name="power"/>
                                </LogoutButton>
                            </UserWrapper>
                        </Header>

                        <HighlightCards>
                            <HighlightCard 
                                type="up"
                                title="Entradas"    
                                amount={highlightData.entries.amount}
                                lastTransactions={highlightData.entries.lastTransaction}
                            />

                            <HighlightCard 
                                type="down"
                                title="Saidas"    
                                amount={highlightData.expensives.amount}
                                lastTransactions={highlightData.expensives.lastTransaction}
                            />

                            <HighlightCard 
                                type="total"
                                title="Total"    
                                amount={highlightData.total.amount}
                                lastTransactions={highlightData.total.lastTransaction}
                            />
                        </HighlightCards>

                        <Transaction>
                            <Title>Listagem</Title>

                            <TransactionsList 
                                data={transactions}
                                keyExtractor={item => item.id}
                                renderItem={({item}) => <TransactionCard data={item}/>}          
                            />                  
                        </Transaction>
                    </>
        }
        </Container>
    )
}

