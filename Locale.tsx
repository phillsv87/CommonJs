import React from 'react';
import { FormattedNumber, IntlProvider } from "react-intl";

export const defaultFormats = {
    number: {
        currency: {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0

        }
    }
};

export const defaultLocale='en';

export function Currency({value}:{value:number}){
    return <FormattedNumber format="currency" value={value}/>;
}

export function DefaultIntlProvider(props:any)
{
    const {formats,locale}=props;
    const copy={...props};
    delete copy.formats;
    delete copy.defaultFormats;
    delete copy.children;
    delete copy.locale;
    return <IntlProvider
        locale={locale||defaultLocale}
        formats={formats||defaultFormats}
        defaultFormats={formats||defaultFormats}>{props.children}</IntlProvider>
}