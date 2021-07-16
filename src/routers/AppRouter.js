import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Redirect
  } from 'react-router-dom';

import Login from '../components/Login';
import PatientInfo from '../components/PatientInfo';
import { PatientInfo2 } from '../components/PatientInfo2';
import { PublicRoute } from './PublicRoute.js';
import { PrivateRoute } from './PrivateRoute.js';
import { useAuth } from '../context/auth';
export const AppRouter = () => {

    const auth = useAuth();

    // useEffect(() => {
        
    //     if ( ( auth && auth.user && auth.user.isValid ) ) {
    //         console.log('esta logeado');
    //     } else {
    //         console.log('no esta logeado');
    //     }

    // }, [auth.user])

    return (
        <Router>
            <div>
                <Switch>

                    <PublicRoute 
                        exact 
                        path="/login" 
                        component={ Login }
                        isAuthenticated={
                                            ( auth && auth.user && auth.user.isValid ) 
                                            ? true
                                            : false
                                        }
                    />

                    <PrivateRoute 
                        exact 
                        path="/" 
                        component={ PatientInfo2 } 
                        isAuthenticated={
                                            ( auth && auth.user && auth.user.isValid ) 
                                            ? true
                                            : false
                                        }
                    />

                    <Redirect to="/" />   
                </Switch>
            </div>
        </Router>
    )

}