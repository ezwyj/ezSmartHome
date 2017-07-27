using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Web;
using System.Text;
using WebService;
using System.Security.Cryptography;

namespace UnitTest
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            string state = @"DdWUvBeMrS7g6md5U667nWtJLbsPC6uddnHTrLyg32FAWH1TcUl6qm1AvhgZtlpe2/sa6ouvMzuSCK9bEaVWTtCHd9UY9qSG81EKkaNM+HbvLT6vks0w/84PvGQ5VHI8NRcnaffv05dvYp+0IKua/zgRof2UzlZWSgFBJvo0Rys=";
            var _key = Convert.FromBase64String(@"uw4FGrtauRGbh2ukh2ZFAA ==");
            
            var r = Decrypt(state, _key);



            //var req = Newtonsoft.Json.JsonConvert.DeserializeObject<StateEntity>(state_nomi);
        }

        [TestMethod]
        public void DecryptTest()
        {
            string key = "06000506080a070404080d0307080d0c0e040a090305050a05050c080200070c0a080b04060b0d02080a0b0605080e0e0b04080e030c00010a0a01030d0e0104";
            string state = @"ttaGvD348YxUjwV9eeIHW1UJvnJ6Hw2vYKWK1u03jz9EPYiHgJiB7hUwYgsTJSjmz2kbC26bpU7CJZ7/AVpVKdmZrr5T6IBjGdZLWKDX4+DIXhZaah6OJ/onq+1bzKiwP1+KHUP/nuln4BelrD2mhNvOK1qgygxb1yhmLjQqh48=";
            var _key = GetMd5(key);
            _key = Convert.FromBase64String(@"a0UcXqpLnhoWpzpHYcl1+A==");
            var r = Decrypt(state, _key);

        }
        private static string Decrypt(string toDecrypt, byte[] key)
        {
            byte[] keyArray = key;
            byte[] inputBuffer = Convert.FromBase64String(toDecrypt);
            RijndaelManaged rDel = new RijndaelManaged();
            rDel.Key = keyArray;
            rDel.Mode = CipherMode.ECB;
            rDel.Padding = PaddingMode.PKCS7;
            ICryptoTransform cTransform = rDel.CreateDecryptor();

            byte[] resultArray = cTransform.TransformFinalBlock(inputBuffer, 0, inputBuffer.Length);

            return Encoding.UTF8.GetString(resultArray);
        }
        /// <summary>
        /// 获得key的MD5
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        private static byte[] GetMd5(string key)
        {

            byte[] result = Encoding.UTF8.GetBytes(key);
            MD5 md5 = new MD5CryptoServiceProvider();
            return md5.ComputeHash(result);
        }
    }
}
