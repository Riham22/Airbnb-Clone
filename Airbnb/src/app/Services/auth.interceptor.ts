import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');

    console.log('Interceptor checking request:', req.url);

    if (token) {
        console.log('Attaching Access Token');
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    } else {
        console.warn('No token found in localStorage');
    }

    return next(req);
};
