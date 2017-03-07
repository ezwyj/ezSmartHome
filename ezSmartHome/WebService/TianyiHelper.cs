using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace WebService
{
    public class TianyiHelper
    {
        public static string HmacSha1Sign(string text, string key)
        {
            Encoding encode = Encoding.GetEncoding("UTF-8");
            byte[] byteData = encode.GetBytes(text);
            byte[] byteKey = encode.GetBytes(key);
            HMACSHA1 hmac = new HMACSHA1(byteKey);
            CryptoStream cs = new CryptoStream(Stream.Null, hmac, CryptoStreamMode.Write);
            cs.Write(byteData, 0, byteData.Length);
            cs.Close();
            return Convert.ToBase64String(hmac.Hash);
        }

        #region  向Url发送post请求  
        /// <summary>  
        /// 向Url发送post请求  
        /// </summary>  
        /// <param name="postData">发送数据</param>  
        /// <param name="uriStr">接受数据的Url</param>  
        /// <returns>返回网站响应请求的回复</returns>  
        public static string RequestPost(string postData, string uriStr)
        {
            HttpWebRequest requestScore = (HttpWebRequest)WebRequest.Create(uriStr);

            ASCIIEncoding encoding = new ASCIIEncoding();
            byte[] data = encoding.GetBytes(postData);
            requestScore.Method = "Post";
            requestScore.ContentType = "application/x-www-form-urlencoded";
            requestScore.ContentLength = data.Length;
            requestScore.KeepAlive = true;

            Stream stream = requestScore.GetRequestStream();
            stream.Write(data, 0, data.Length);
            stream.Close();

            HttpWebResponse responseSorce;
            try
            {
                responseSorce = (HttpWebResponse)requestScore.GetResponse();
            }
            catch (WebException ex)
            {
                responseSorce = (HttpWebResponse)ex.Response;//得到请求网站的详细错误提示  
            }
            StreamReader reader = new StreamReader(responseSorce.GetResponseStream(), Encoding.UTF8);
            string content = reader.ReadToEnd();

            requestScore.Abort();
            responseSorce.Close();
            responseSorce.Close();
            reader.Dispose();
            stream.Dispose();
            return content;
        }
        #endregion
    }
}