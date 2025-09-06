import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// import jwt from 'jsonwebtoken';
// function generateCustomJWT(user: any) {
//   return jwt.sign(
//     {
//       id: user.id,
//       email: user.email,
//     },
//     process.env.NEXTAUTH_SECRET!,
//     { expiresIn: "1h" }
//   );
// }


const handler = NextAuth({
    providers: [
        GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
            params: {
            scope: 'openid email profile https://www.googleapis.com/auth/userinfo.email', // include needed scopes
            access_type: 'offline', // important to get refresh token on initial sign in
            prompt: 'consent', // force consent to get refresh token
            },
        },
        }),
    ],
    callbacks: {
        // async jwt({ token, account, user }) {
        //     if (account && account.provider === "google"){token.accessToken = generateCustomJWT(user);}
        //     return token;
        // },
        async jwt({ token, account }: { token: JWT; account?: any }) {
            // Persist the OAuth access_token and refresh_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;  // you can save refresh token if you want to handle refreshing manually
                token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : null; // expires_at is in seconds
            }
            return token;
        },
        // async session({ session, token }) {
        //     if (session.user && token.sub){
        //         session.accessToken = token.accessToken as string;
        //         session.user.id = token.sub; // set user id from token
        //     }
        //     return session;
        // },
        async session({ session, token }: { session: any; token: JWT }) {
            // Make the access token available on the client session object
            if (session.user && token.sub){
                session.accessToken = token.accessToken;
                session.user.id = token.sub; // set user id from token
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            return '/dashboard';
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };