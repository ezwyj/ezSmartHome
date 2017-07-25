using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace WebService
{

    public class AES
    {
        /// <summary>
        /// 获取密钥
        /// </summary>
        public static string decrypt(string toDecrypt, byte[] key)
        {
            byte[] keyArray = key;
            byte[] inputBuffer = Convert.FromBase64String(toDecrypt);
            RijndaelManaged rDel = new RijndaelManaged();
            rDel.Key = keyArray;
            rDel.Mode = CipherMode.ECB;
            rDel.Padding = PaddingMode.Zeros;
            ICryptoTransform cTransform = rDel.CreateDecryptor();

            byte[] resultArray = cTransform.TransformFinalBlock(inputBuffer, 0, inputBuffer.Length);

            return Encoding.UTF8.GetString(resultArray);


        }

        public static byte[] GetMd5(string key)
        {

            byte[] result = Encoding.UTF8.GetBytes(key);
            MD5 md5 = new MD5CryptoServiceProvider();
            return md5.ComputeHash(result);
        }
    }
}
